/**
 * Cloud-Native Book Application
 * Modern ES6 Single Page Application with Hierarchical Navigation
 */

class CloudNativeBookApp {
    constructor() {
        // Application state
        this.topics = [];
        this.units = [];
        this.currentIndex = -1; // Start with book overview
        this.totalTopics = 902; // Last index in the hierarchy
        
        // DOM elements
        this.elements = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🚀 Initializing Cloud-Native Book App...');
        
        try {
            this.cacheElements();
            this.buildHierarchicalStructure();
            this.setupEventListeners();
            this.initializeLibraries();
            this.buildSearchIndex();
            this.loadBookOverview();
            
            console.log('✅ App initialization complete');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to initialize application', error);
        }
    }

    cacheElements() {
        this.elements = {
            // Mobile navigation
            mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
            sidebar: document.querySelector('.sidebar'),
            
            // Search
            searchInput: document.querySelector('.search-input'),
            searchResults: document.querySelector('.search-results'),
            
            // Navigation
            navMenu: document.querySelector('.nav-menu'),
            unitToggles: document.querySelectorAll('.unit-toggle'),
            unitLinks: document.querySelectorAll('.unit-link'),
            navLinks: document.querySelectorAll('.nav-link[data-index]'),
            
            // Content
            contentArea: document.getElementById('content-area'),
            
            // Progress
            unitProgress: document.getElementById('unit-progress'),
            overallProgress: document.getElementById('overall-progress'),
            navProgress: document.getElementById('nav-progress'),
            
            // Navigation buttons
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            floatingNav: document.getElementById('floating-nav')
        };
    }

    buildHierarchicalStructure() {
        this.units = [];
        this.topics = [];

        // Add book overview
        this.topics.push({
            index: -1,
            url: 'src/book/overview.html',
            title: 'Book Overview',
            type: 'overview'
        });

        // Build units and topics from navigation structure
        const unitElements = document.querySelectorAll('.unit');
        
        unitElements.forEach((unitEl, unitNumber) => {
            const unitLink = unitEl.querySelector('.unit-link');
            const unitTopics = [];
            
            if (unitLink) {
                const unitIndex = parseInt(unitLink.dataset.index, 10);
                
                // Add unit overview to topics
                this.topics.push({
                    index: unitIndex,
                    url: unitLink.href,
                    title: unitLink.textContent.trim(),
                    type: 'unit_overview',
                    unit: unitNumber + 1
                });

                unitTopics.push({
                    index: unitIndex,
                    url: unitLink.href,
                    title: unitLink.textContent.trim(),
                    type: 'unit_overview'
                });
            }

            // Get all topic links in this unit
            const topicLinks = unitEl.querySelectorAll('.unit-topics .nav-link[data-index]');
            
            topicLinks.forEach(link => {
                const index = parseInt(link.dataset.index, 10);
                
                // Skip unit overview (already added above)
                if (unitLink && index === parseInt(unitLink.dataset.index, 10)) {
                    return;
                }

                const topic = {
                    index: index,
                    url: link.href,
                    title: link.textContent.trim(),
                    type: this.getTopicType(link.textContent),
                    unit: unitNumber + 1
                };

                this.topics.push(topic);
                unitTopics.push(topic);
            });

            // Store unit information
            this.units.push({
                number: unitNumber + 1,
                name: unitLink ? unitLink.textContent.trim() : `Unit ${unitNumber + 1}`,
                topics: unitTopics,
                element: unitEl
            });
        });

        // Sort topics by index for proper navigation order
        this.topics.sort((a, b) => {
            if (a.index === -1) return -1;
            if (b.index === -1) return 1;
            return a.index - b.index;
        });

        console.log(`📚 Built hierarchical structure: ${this.units.length} units, ${this.topics.length} total items`);
    }

    getTopicType(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('overview')) return 'overview';
        if (titleLower.includes('study aids')) return 'study_aids';
        if (titleLower.includes('quiz')) return 'quiz';
        if (titleLower.includes('exam')) return 'exam';
        if (titleLower.includes('project')) return 'project';
        return 'content';
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Unit toggles
        this.elements.unitToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleUnit(toggle);
            });
        });

        // Unit links (direct navigation to unit overview)
        this.elements.unitLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(link.dataset.index, 10);
                this.loadContent(link.href, index);
                this.closeMobileMenu();
            });
        });

        // All navigation links
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Skip if this is a unit link (already handled above)
                if (link.classList.contains('unit-link')) {
                    return;
                }
                
                e.preventDefault();
                const index = parseInt(link.dataset.index, 10);
                this.loadContent(link.href, index);
                this.closeMobileMenu();
            });
        });

        // Search functionality
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            this.elements.searchInput.addEventListener('focus', () => {
                this.elements.searchInput.parentElement.classList.add('search-focused');
            });

            this.elements.searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.elements.searchInput.parentElement.classList.remove('search-focused');
                    this.elements.searchResults.innerHTML = '';
                }, 200);
            });
        }

        // Navigation buttons
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.navigate(1));
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigate(-1);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigate(1);
                    break;
            }
        });

        // Touch/swipe support for mobile
        this.setupTouchNavigation();

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.elements.sidebar.contains(e.target) && 
                !this.elements.mobileMenuToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let isScrolling = false;

        this.elements.contentArea.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = false;
        }, { passive: true });

        this.elements.contentArea.addEventListener('touchmove', (e) => {
            if (!startX || isScrolling) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - startX);
            const diffY = Math.abs(currentY - startY);

            if (diffY > diffX) {
                isScrolling = true;
                return;
            }

            if (diffX > 20) {
                e.preventDefault();
            }
        }, { passive: false });

        this.elements.contentArea.addEventListener('touchend', (e) => {
            if (!startX || isScrolling) {
                startX = startY = 0;
                isScrolling = false;
                return;
            }

            const endX = e.changedTouches[0].clientX;
            const swipeDistance = endX - startX;
            const minSwipeDistance = 50;

            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    this.navigate(-1); // Previous
                } else {
                    this.navigate(1);  // Next
                }
            }

            startX = startY = 0;
            isScrolling = false;
        }, { passive: true });
    }

    toggleMobileMenu() {
        this.elements.sidebar.classList.toggle('open');
    }

    closeMobileMenu() {
        this.elements.sidebar.classList.remove('open');
    }

    toggleUnit(toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const unitTopics = toggle.parentElement.querySelector('.unit-topics');

        toggle.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            unitTopics.classList.remove('expanded');
        } else {
            unitTopics.classList.add('expanded');
        }
    }

    async loadContent(url, index) {
        try {
            console.log(`📄 Loading content: ${url} (index: ${index})`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            this.elements.contentArea.innerHTML = html;
            this.currentIndex = index;

            this.updateUI();
            this.initializeContentFeatures();

        } catch (error) {
            console.error('Error loading content:', error);
            this.showError('Content Not Found', 'Sorry, the requested content could not be loaded.');
        }
    }

    async loadBookOverview() {
        const bookOverview = this.topics.find(topic => topic.index === -1);
        if (bookOverview) {
            await this.loadContent(bookOverview.url, -1);
        }
    }

    navigate(direction) {
        const currentTopicIndex = this.topics.findIndex(topic => topic.index === this.currentIndex);
        
        if (currentTopicIndex === -1) {
            console.warn('Current topic not found in hierarchy');
            return;
        }

        let newTopicIndex = currentTopicIndex + direction;

        // Boundary checks
        if (newTopicIndex < 0 || newTopicIndex >= this.topics.length) {
            console.log('Navigation boundary reached');
            return;
        }

        const targetTopic = this.topics[newTopicIndex];
        if (targetTopic) {
            this.loadContent(targetTopic.url, targetTopic.index);
        }
    }

    updateUI() {
        this.updateActiveLinks();
        this.updateProgress();
        this.updateNavigationButtons();
    }

    updateActiveLinks() {
        // Remove all active states
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Set active link
        const activeLinks = document.querySelectorAll(`[data-index='${this.currentIndex}']`);
        activeLinks.forEach(link => {
            link.classList.add('active');

            // Expand parent unit if needed
            const unitTopics = link.closest('.unit-topics');
            if (unitTopics && !unitTopics.classList.contains('expanded')) {
                const unitToggle = unitTopics.parentElement.querySelector('.unit-toggle');
                if (unitToggle) {
                    unitToggle.setAttribute('aria-expanded', 'true');
                    unitTopics.classList.add('expanded');
                }
            }
        });
    }

    updateProgress() {
        const currentTopicIndex = this.topics.findIndex(topic => topic.index === this.currentIndex);
        const totalTopics = this.topics.length - 1; // Exclude book overview
        
        let overallCompleted, overallPercentage, overallText;

        if (this.currentIndex === -1) {
            // Book overview page
            overallCompleted = 0;
            overallPercentage = 0;
            overallText = `0/${totalTopics} (0%)`;
        } else {
            // Regular topics (currentTopicIndex - 1 because overview is at index 0)
            overallCompleted = Math.max(0, currentTopicIndex);
            overallPercentage = totalTopics > 0 ? (overallCompleted / totalTopics) * 100 : 0;
            overallText = `${overallCompleted}/${totalTopics} (${Math.round(overallPercentage)}%)`;
        }

        // Update overall progress
        if (this.elements.overallProgress) {
            this.elements.overallProgress.style.width = `${overallPercentage}%`;
            const progressText = this.elements.overallProgress.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = overallText;
            }
        }

        // Update navigation progress
        if (this.elements.navProgress) {
            const currentDisplay = this.currentIndex === -1 ? 0 : overallCompleted;
            this.elements.navProgress.textContent = `${currentDisplay}/${totalTopics}`;
        }

        // Update unit progress
        this.updateUnitProgress();
    }

    updateUnitProgress() {
        if (!this.elements.unitProgress) return;

        const currentTopic = this.topics.find(topic => topic.index === this.currentIndex);
        
        if (!currentTopic || currentTopic.index === -1) {
            // Book overview or not found
            this.elements.unitProgress.style.width = '0%';
            const unitProgressText = this.elements.unitProgress.querySelector('.progress-text');
            if (unitProgressText) {
                unitProgressText.textContent = '0%';
            }
            return;
        }

        const currentUnit = this.units.find(unit => unit.number === currentTopic.unit);
        if (currentUnit) {
            const unitTopics = currentUnit.topics.filter(topic => topic.type !== 'unit_overview');
            const currentTopicInUnit = unitTopics.findIndex(topic => topic.index === this.currentIndex);
            
            if (currentTopicInUnit >= 0) {
                const completedInUnit = currentTopicInUnit + 1;
                const totalInUnit = unitTopics.length;
                const unitProgressPercentage = (completedInUnit / totalInUnit) * 100;
                
                this.elements.unitProgress.style.width = `${unitProgressPercentage}%`;
                const unitProgressText = this.elements.unitProgress.querySelector('.progress-text');
                if (unitProgressText) {
                    unitProgressText.textContent = `${Math.round(unitProgressPercentage)}%`;
                }
            }
        }
    }

    updateNavigationButtons() {
        const currentTopicIndex = this.topics.findIndex(topic => topic.index === this.currentIndex);
        const isFirstTopic = currentTopicIndex <= 0;
        const isLastTopic = currentTopicIndex >= this.topics.length - 1;

        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = isFirstTopic;
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = isLastTopic;
        }
    }

    initializeLibraries() {
        // Initialize Mermaid
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose'
            });
            console.log('📊 Mermaid initialized');
        }

        // Initialize Prism (auto-initializes)
        console.log('🎨 Prism syntax highlighting ready');
    }

    async buildSearchIndex() {
        // Build search index with Lunr.js if available
        if (typeof lunr === 'undefined') {
            console.log('🔍 Lunr.js not available, using fallback search');
            return;
        }

        try {
            console.log('🔍 Building search index...');
            
            // Preload some content for indexing (sample a few important pages)
            const importantTopics = this.topics.filter(topic => 
                topic.type === 'unit_overview' || 
                topic.type === 'content' || 
                topic.type === 'overview'
            ).slice(0, 20); // Limit to prevent too many requests

            for (const topic of importantTopics) {
                try {
                    const response = await fetch(topic.url);
                    if (response.ok) {
                        const html = await response.text();
                        // Extract text content from HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        topic.content = doc.body.textContent || doc.body.innerText || '';
                    }
                } catch (error) {
                    console.warn(`Failed to load content for indexing: ${topic.url}`);
                }
            }

            // Build Lunr index
            this.searchIndex = lunr(function () {
                this.ref('index');
                this.field('title', { boost: 10 });
                this.field('content');
                this.field('type');

                // Add documents to index
                for (const topic of this.topics) {
                    this.add({
                        index: topic.index,
                        title: topic.title,
                        content: topic.content || '',
                        type: topic.type
                    });
                }
            }.bind({ topics: this.topics }));

            console.log('✅ Search index built successfully');
        } catch (error) {
            console.error('❌ Failed to build search index:', error);
        }
    }

    initializeContentFeatures() {
        // Re-run Mermaid on new content
        if (typeof mermaid !== 'undefined') {
            mermaid.run({ nodes: this.elements.contentArea.querySelectorAll('.mermaid') });
        }

        // Re-run Prism on new content
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(this.elements.contentArea);
        }

        // Initialize any interactive content
        this.initializeFlashcards();
        this.initializeQuizzes();
        this.initializeUnitOverviewFeatures();
    }

    initializeFlashcards() {
        const flashcards = this.elements.contentArea.querySelectorAll('.flashcard');
        flashcards.forEach(flashcard => {
            flashcard.addEventListener('click', function(e) {
                if (e.target.closest('button')) return;
                this.classList.toggle('flipped');
            });
        });
    }

    initializeQuizzes() {
        // Quiz initialization logic would go here
        const quizzes = this.elements.contentArea.querySelectorAll('.quiz-container');
        console.log(`🧪 Found ${quizzes.length} quizzes in content`);
    }

    initializeUnitOverviewFeatures() {
        // Initialize unit overview page features
        const startButtons = this.elements.contentArea.querySelectorAll('.btn-start');
        const continueButtons = this.elements.contentArea.querySelectorAll('.btn-continue');

        startButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Extract unit number from onclick attribute or data
                const unitMatch = btn.getAttribute('onclick')?.match(/startUnit\((\d+)\)/);
                if (unitMatch) {
                    this.startUnit(parseInt(unitMatch[1], 10));
                }
            });
        });

        continueButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const unitMatch = btn.getAttribute('onclick')?.match(/continueUnit\((\d+)\)/);
                if (unitMatch) {
                    this.continueUnit(parseInt(unitMatch[1], 10));
                }
            });
        });
    }

    // Unit navigation helpers
    startUnit(unitNumber) {
        const unit = this.units.find(u => u.number === unitNumber);
        if (unit && unit.topics.length > 1) {
            // Start with first content topic (skip unit overview)
            const firstContentTopic = unit.topics.find(topic => topic.type !== 'unit_overview');
            if (firstContentTopic) {
                this.loadContent(firstContentTopic.url, firstContentTopic.index);
            }
        }
    }

    continueUnit(unitNumber) {
        // This would check progress and continue from where left off
        // For now, just start the unit
        this.startUnit(unitNumber);
    }

    async handleSearch(query) {
        if (query.length < 2) {
            this.elements.searchResults.innerHTML = '';
            return;
        }

        try {
            // Enhanced search implementation with content indexing
            let results = [];
            
            if (typeof lunr !== 'undefined' && this.searchIndex) {
                // Use Lunr.js for full-text search if available
                const searchResults = this.searchIndex.search(query);
                results = searchResults.map(result => {
                    return this.topics.find(topic => topic.index.toString() === result.ref);
                }).filter(Boolean).slice(0, 8);
            } else {
                // Fallback to simple title and content search
                const queryLower = query.toLowerCase();
                results = this.topics.filter(topic => {
                    return topic.title.toLowerCase().includes(queryLower) ||
                           (topic.content && topic.content.toLowerCase().includes(queryLower));
                }).slice(0, 8);
            }

            const resultHtml = results.map(result => `
                <div class="search-result-item" data-index="${result.index}">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-type">${this.getTypeLabel(result.type)}</div>
                </div>
            `).join('');

            this.elements.searchResults.innerHTML = resultHtml || 
                '<div class="search-result-item">No results found</div>';

            // Add click handlers to results
            this.elements.searchResults.querySelectorAll('[data-index]').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index, 10);
                    const topic = this.topics.find(t => t.index === index);
                    if (topic) {
                        this.loadContent(topic.url, index);
                        this.elements.searchInput.value = '';
                        this.elements.searchResults.innerHTML = '';
                        this.closeMobileMenu();
                    }
                });
            });
        } catch (error) {
            console.error('Search error:', error);
            this.elements.searchResults.innerHTML = 
                '<div class="search-result-item">Search temporarily unavailable</div>';
        }
    }

    getTypeLabel(type) {
        const labels = {
            overview: '📖 Overview',
            unit_overview: '📚 Unit Overview',
            content: '📄 Content',
            study_aids: '🎯 Study Aids',
            quiz: '❓ Quiz',
            exam: '📝 Exam',
            project: '🛠️ Project'
        };
        return labels[type] || '📄 Content';
    }

    showError(title, message) {
        this.elements.contentArea.innerHTML = `
            <div class="text-center" style="padding: var(--space-xl); color: var(--danger);">
                <h2>⚠️ ${title}</h2>
                <p>${message}</p>
                <button onclick="app.loadBookOverview()" class="btn btn-primary" style="margin-top: var(--space-md);">
                    Return to Book Overview
                </button>
            </div>
        `;
    }
}

// Initialize the application
const app = new CloudNativeBookApp();

// Make app globally available for debugging and unit overview interactions
window.app = app;

console.log('🌐 Cloud-Native Book App loaded with hierarchical navigation');