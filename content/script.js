document.addEventListener('DOMContentLoaded', () => {
    const navMenu = document.getElementById('nav-menu');
    const contentArea = document.getElementById('content-area');
    const progressBar = document.getElementById('progress-bar');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    let topics = [];
    let currentIndex = -1;

    // Toggle unit visibility
    navMenu.addEventListener('click', (e) => {
        if (e.target.matches('.unit > a')) {
            e.preventDefault();
            const topicsList = e.target.nextElementSibling;
            if (topicsList) {
                topicsList.style.display = topicsList.style.display === 'block' ? 'none' : 'block';
            }
        }
    });

    // Load content
    navMenu.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A' && !e.target.parentElement.classList.contains('unit')) {
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
            updateProgressBar();
            updateNavButtons();
        } catch (error) {
            console.error('Error loading content:', error);
            contentArea.innerHTML = `<p>Error loading content. Please try again later.</p>`;
        }
    }

    function updateActiveLink() {
        document.querySelectorAll('#nav-menu a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`#nav-menu a[data-index='${currentIndex}']`);
        if (activeLink) {
            activeLink.classList.add('active');
            // Ensure parent unit is expanded
            const parentTopics = activeLink.closest('.topics');
            if (parentTopics) {
                parentTopics.style.display = 'block';
            }
        }
    }

    function updateProgressBar() {
        const percentage = topics.length > 0 ? ((currentIndex + 1) / topics.length) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${currentIndex + 1} / ${topics.length}`;
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

    function initialize() {
        const topicLinks = document.querySelectorAll('#nav-menu .topics a');
        topicLinks.forEach((link, index) => {
            link.dataset.index = index;
            topics.push({ url: link.getAttribute('href'), title: link.textContent });
        });

        // Load initial content (overview or first topic)
        const overviewLink = document.querySelector('#nav-menu a[href*="overview.html"]');
        if (overviewLink) {
            loadContent(overviewLink.getAttribute('href'), -1); // Special index for overview
        } else if (topics.length > 0) {
            loadContent(topics[0].url, 0);
        }
        updateProgressBar(); // Initial progress bar update
    }

    initialize();
});