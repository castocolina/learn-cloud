document.addEventListener('DOMContentLoaded', () => {
    const navMenu = document.getElementById('nav-menu');
    const contentArea = document.getElementById('content-area');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    // Progress Bar Elements
    const unitProgressBar = document.getElementById('unit-progress-bar');
    const unitProgressLabel = document.getElementById('unit-progress-label');
    const overallProgressBar = document.getElementById('overall-progress-bar');
    // Navigation Buttons
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    let topics = [];
    let units = [];
    let currentIndex = -1;
    let lunrIndex;

    // Load content
    navMenu.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('href').includes('.html')) {
            e.preventDefault();
            const url = e.target.getAttribute('href');
            const index = parseInt(e.target.dataset.index, 10);
            await loadContent(url, index);
        }
    });

    async function loadContent(url, index) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            contentArea.innerHTML = html;
            currentIndex = index;
            updateActiveLink();
            updateProgressBars();
            updateNavButtons();
            
            // Initialize Mermaid and Prism after content is loaded
            mermaid.run({ nodes: contentArea.querySelectorAll('.mermaid') });
            Prism.highlightAllUnder(contentArea);

        } catch (error) {
            console.error('Error loading content:', error);
            contentArea.innerHTML = `<p>Error loading content. Please try again later.</p>`;
        }
    }

    function updateActiveLink() {
        document.querySelectorAll('#nav-menu .nav-link').forEach(a => {
            a.classList.remove('active');
            if (!a.href.includes('overview.html')) {
                a.classList.add('link-dark');
            }
        });

        const activeLink = document.querySelector(`#nav-menu a[data-index='${currentIndex}']`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.classList.remove('link-dark');
            const parentCollapse = activeLink.closest('.collapse');
            if (parentCollapse && !parentCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(parentCollapse, { toggle: false });
                bsCollapse.show();
            }
        }
    }

    function updateProgressBars() {
        const totalTopics = topics.length;
        const overallCompleted = Math.max(0, currentIndex + 1);
        const overallPercentage = totalTopics > 0 ? (overallCompleted / totalTopics) * 100 : 0;
        overallProgressBar.style.width = `${overallPercentage}%`;
        overallProgressBar.textContent = `${overallCompleted}/${totalTopics} (${Math.round(overallPercentage)}%)`;

        unitProgressBar.style.width = '0%';
        unitProgressBar.textContent = '';
        unitProgressLabel.textContent = 'Unit Progress';

        if (currentIndex === -1) {
            unitProgressLabel.textContent = 'Select a unit to begin';
        } else if (currentIndex >= 0) {
            const currentUnit = units.find(unit => unit.topics.some(topic => topic.index === currentIndex));
            if (currentUnit) {
                const totalInUnit = currentUnit.topics.length;
                const firstTopicIndexInUnit = currentUnit.topics[0].index;
                const completedInUnit = currentIndex - firstTopicIndexInUnit + 1;
                const unitProgressPercentage = (completedInUnit / totalInUnit) * 100;
                unitProgressBar.style.width = `${unitProgressPercentage}%`;
                unitProgressBar.textContent = `${completedInUnit}/${totalInUnit} (${Math.round(unitProgressPercentage)}%)`;
                unitProgressLabel.textContent = currentUnit.name;
            }
        }
    }

    function updateNavButtons() {
        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= topics.length - 1;
    }

    async function navigate(direction) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < topics.length) {
            const nextTopic = topics[newIndex];
            await loadContent(nextTopic.url, newIndex);
        }
    }

    prevButton.addEventListener('click', () => navigate(-1));
    nextButton.addEventListener('click', () => navigate(1));

    async function initializeSearch() {
        const documents = await Promise.all(topics.map(async (topic) => {
            try {
                const response = await fetch(topic.url);
                if (!response.ok) return null;
                const htmlContent = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const textContent = doc.body.textContent || "";
                return {
                    id: topic.url,
                    title: topic.title,
                    content: textContent,
                    index: topic.index
                };
            } catch (e) {
                console.error(`Failed to fetch ${topic.url} for search index`, e);
                return null;
            }
        }));

        lunrIndex = lunr(function () {
            this.ref('id');
            this.field('title', { boost: 10 });
            this.field('content');
            
            documents.filter(Boolean).forEach(doc => {
                this.add(doc);
            });
        });
    }

    searchInput.addEventListener('keyup', () => {
        const query = searchInput.value;
        if (query.length < 3) {
            searchResults.innerHTML = '';
            return;
        }
        const results = lunrIndex.search(query);
        displaySearchResults(results);
    });

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="list-group-item">No results found.</div>';
            return;
        }

        const resultHtml = results.map(result => {
            const topic = topics.find(t => t.url === result.ref);
            if (topic) {
                return `<a href="${topic.url}" data-index="${topic.index}" class="list-group-item list-group-item-action search-result-item">${topic.title}</a>`;
            }
            return '';
        }).join('');

        searchResults.innerHTML = `<div class="list-group">${resultHtml}</div>`;
    }

    searchResults.addEventListener('click', async (e) => {
        if (e.target.classList.contains('search-result-item')) {
            e.preventDefault();
            const url = e.target.getAttribute('href');

            const index = parseInt(e.target.dataset.index, 10);
            await loadContent(url, index);
            // Clear search
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    });

    function initialize() {
        const unitElements = document.querySelectorAll('#nav-menu .unit');
        let topicGlobalIndex = 0;

        unitElements.forEach(unitEl => {
            const unitTopics = [];
            const topicLinks = unitEl.querySelectorAll('.collapse .nav-link');
            topicLinks.forEach(link => {
                link.dataset.index = topicGlobalIndex;
                unitTopics.push({
                    url: link.getAttribute('href'),
                    title: link.textContent,
                    index: topicGlobalIndex
                });
                topicGlobalIndex++;
            });
            units.push({
                name: unitEl.querySelector('a[data-bs-toggle="collapse"]').textContent,
                topics: unitTopics,
                element: unitEl
            });
        });

        topics = units.flatMap(unit => unit.topics);

        const overviewLink = document.querySelector('#nav-menu > .nav-item > a[href*="overview.html"]');
        overviewLink.dataset.index = -1;

        if (overviewLink) {
            loadContent(overviewLink.getAttribute('href'), -1);
        } else if (topics.length > 0) {
            loadContent(topics[0].url, 0);
        }
        updateProgressBars();
        initializeSearch(); // Build the search index
    }

    // Initialize Mermaid.js
    mermaid.initialize({ startOnLoad: false, theme: 'default' });

    initialize();
});