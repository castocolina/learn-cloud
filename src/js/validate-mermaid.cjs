const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const { exec } = require('child_process');

const mmdcPath = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'mmdc');
const MAX_PARALLEL_FILES = 4;

function decodeDiagram(diagram) {
    return diagram
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/&#x27;/g, "'");
}

// Improved: finds the line using unique diagram content
function findLineNumber(content, diagram) {
    const lines = content.split('\n');
    
    // Extract the first few unique lines of the diagram content
    const diagramLines = diagram.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (diagramLines.length === 0) return -1;
    
    // Use the first meaningful content line (skip "graph TD" as it's common)
    let uniqueLine = diagramLines.find(line => 
        !line.match(/^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/i) && 
        line.length > 5 && 
        !line.match(/^\s*$/)
    );
    
    // If no unique line found, use the second line or first available
    if (!uniqueLine && diagramLines.length > 1) {
        uniqueLine = diagramLines[1];
    } else if (!uniqueLine) {
        uniqueLine = diagramLines[0];
    }
    
    // Search for this unique line in the HTML content
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(uniqueLine)) {
            // Find the start of the mermaid block (look backwards for <pre class="mermaid">)
            for (let j = i; j >= Math.max(0, i - 10); j--) {
                if (lines[j].includes('<pre class="mermaid">')) {
                    return j + 1;
                }
            }
            // If not found, return the line where unique content was found
            return i + 1;
        }
    }
    return -1;
}

function validateDiagram(diagram, file, index, lineNumber) {
    return new Promise((resolve) => {
        const tempFilePath = `/tmp/mermaid-validate-${process.pid}-${Date.now()}-${Math.random()}.mmd`;
        fs.writeFileSync(tempFilePath, diagram);

        exec(
            `"${mmdcPath}" --puppeteerConfigFile "${process.cwd()}/puppeteer-config.json" -i "${tempFilePath}" -o "/tmp/mermaid-output-${Date.now()}-${Math.random()}.svg"`,
            (error, stdout, stderr) => {
                fs.unlinkSync(tempFilePath);
                if (error) {
                    console.error(`🔴 [${file}] Diagram ${index + 1} (line ${lineNumber}): SYNTAX ERROR`);
                    console.error(stderr);
                    resolve({ error: true, file, index, lineNumber });
                } else {
                    console.log(`✅ [${file}] Diagram ${index + 1} (line ${lineNumber}): OK`);
                    resolve({ error: false, file, index, lineNumber });
                }
            }
        );
    });
}

async function processFile(file, stats) {
    const content = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(content);
    const mermaidElements = $('.mermaid');

    if (mermaidElements.length === 0) return [];

    stats.files++;
    stats.diagrams += mermaidElements.length;

    console.log(`\nFound ${mermaidElements.length} Mermaid diagram(s) in ${file}`);

    const diagramPromises = [];
    for (let i = 0; i < mermaidElements.length; i++) {
        let diagram = $(mermaidElements[i]).text().trim();
        if (!diagram) {
            console.log(`  - Diagram ${i + 1} is empty. Skipping.`);
            continue;
        }
        diagram = decodeDiagram(diagram);
        // Use diagram content to find the specific line
        const lineNumber = findLineNumber(content, diagram);
        diagramPromises.push(
            validateDiagram(diagram, file, i, lineNumber).then((result) => {
                if (result.error) stats.nok++;
                else stats.ok++;
                return result;
            })
        );
    }
    return Promise.all(diagramPromises);
}

// Async pool implementation
async function asyncPool(poolLimit, array, iteratorFn) {
    const ret = [];
    const executing = [];
    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (poolLimit <= array.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

async function validateMermaid() {
    console.log('Starting Mermaid diagram validation...');
    const startTime = Date.now();

    const targetFile = process.argv[2];
    let files;

    if (targetFile && targetFile.trim() !== '""' && targetFile.trim() !== "") {
        if (fs.existsSync(targetFile) && fs.lstatSync(targetFile).isDirectory()) {
            console.log(`Validating Mermaid diagrams in directory: ${targetFile}`);
            files = await glob(`${targetFile}/**/*.html`);
            files.sort();
        } else if (targetFile.endsWith('/')) {
            console.log(`Validating Mermaid diagrams in directory: ${targetFile}`);
            files = await glob(`${targetFile}**/*.html`);
            files.sort();
        } else {
            console.log(`Validating specific file: ${targetFile}`);
            files = [targetFile];
        }
    } else {
        console.log('Validating all HTML files...');
        files = await glob('src/book/**/*.html');
        files.sort();
    }

    const stats = { files: 0, diagrams: 0, ok: 0, nok: 0 };

    await asyncPool(MAX_PARALLEL_FILES, files, (file) => processFile(file, stats));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n--- SUMMARY ---');
    console.log(`Files processed: ${stats.files}`);
    console.log(`Diagrams found: ${stats.diagrams}`);
    console.log(`Valid diagrams (OK): ${stats.ok}`);
    console.log(`Invalid diagrams (NOK): ${stats.nok}`);
    console.log(`Total duration: ${duration} seconds`);

    if (stats.nok > 0) {
        console.error('Validation failed. One or more Mermaid diagrams have syntax or style errors.');
        process.exit(1);
    } else {
        console.log('All Mermaid diagrams validated successfully!');
        process.exit(0);
    }
}

validateMermaid();