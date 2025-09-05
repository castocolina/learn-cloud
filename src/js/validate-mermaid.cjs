
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const { exec } = require('child_process');

// Path to the mmdc executable
const mmdcPath = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'mmdc');
const tempFilePath = '/tmp/mermaid-validate.mmd';



async function validateMermaid() {
    console.log('Starting Mermaid diagram validation...');
    
    // Check for file argument from command line
    const targetFile = process.argv[2];
    let files;
    
    if (targetFile && targetFile.trim() !== '""' && targetFile.trim() !== "") {
        // Check if target is a directory
        if (fs.existsSync(targetFile) && fs.lstatSync(targetFile).isDirectory()) {
            console.log(`Validating Mermaid diagrams in directory: ${targetFile}`);
            files = await glob(`${targetFile}/**/*.html`);
            files.sort();
        } else if (targetFile.endsWith('/')) {
            // Directory path ending with /
            console.log(`Validating Mermaid diagrams in directory: ${targetFile}`);
            files = await glob(`${targetFile}**/*.html`);
            files.sort();
        } else {
            // Single file
            console.log(`Validating specific file: ${targetFile}`);
            files = [targetFile];
        }
    } else {
        // Default: validate all HTML files
        console.log('Validating all HTML files...');
        files = await glob('src/book/**/*.html');
        files.sort(); // Sort files alphabetically for consistent order
    }
    
    let hasErrors = false;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        const mermaidElements = $('.mermaid');

        if (mermaidElements.length === 0) {
            continue;
        }

        console.log(`\n\nFound ${mermaidElements.length} Mermaid diagram(s) in ${file} \n`);

        for (let i = 0; i < mermaidElements.length; i++) {
            const element = mermaidElements[i];
            let diagram = $(element).text().trim();

            if (!diagram) {
                console.log(`  - Diagram ${i + 1} is empty. Skipping.`);
                continue;
            }

            // Decode HTML entities that might be present in the diagram text
            diagram = diagram
                .replace(/&quot;/g, '"')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&amp;/g, '&')
                .replace(/&#x27;/g, "'");

            fs.writeFileSync(tempFilePath, diagram);

            await new Promise((resolve) => {
                exec(`"${mmdcPath}" --puppeteerConfigFile "${process.cwd()}/puppeteer-config.json" -i "${tempFilePath}" -o "/tmp/mermaid-output-${Date.now()}.svg"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`  - 🔴 SYNTAX ERROR in diagram ${i + 1} in file: ${file}`);
                        console.error(stderr);
                        hasErrors = true;
                    } else {
                        console.log(`  - ✅ Diagram ${i + 1} in ${file} is valid.`);
                    }
                    resolve();
                });
            });
        }
    }

    if (hasErrors) {
        console.error('Validation failed. One or more Mermaid diagrams have syntax or style errors.');
        process.exit(1);
    } else {
        console.log('All Mermaid diagrams validated successfully!');
        process.exit(0);
    }
}

validateMermaid();
