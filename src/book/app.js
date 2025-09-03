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
                    this.hideSearchResults();
                }, 200);
            });

            // Close search results when clicking outside
            document.addEventListener('click', (e) => {
                const searchContainer = this.elements.searchInput?.parentElement;
                const searchResults = this.elements.searchResults;
                
                if (searchContainer && searchResults && 
                    !searchContainer.contains(e.target) && 
                    !searchResults.contains(e.target)) {
                    this.hideSearchResults();
                }
            });

            // Handle window resize for search results positioning
            window.addEventListener('resize', () => {
                this.positionSearchResults();
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
            const topics = this.topics;
            this.searchIndex = lunr(function () {
                this.ref('index');
                this.field('title', { boost: 10 });
                this.field('content');
                this.field('type');

                // Add documents to index
                for (const topic of topics) {
                    this.add({
                        index: topic.index,
                        title: topic.title,
                        content: topic.content || '',
                        type: topic.type
                    });
                }
            });

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
        
        // Setup flashcard modal
        setupFlashcardModal();
    }

    initializeFlashcards() {
        const flashcards = this.elements.contentArea.querySelectorAll('.flashcard');
        console.log(`🎴 Found ${flashcards.length} flashcards to initialize`);
        
        flashcards.forEach((flashcard, index) => {
            // Ensure the flashcard has the proper event listener
            const inner = flashcard.querySelector('.flashcard-inner');
            if (inner) {
                // Remove onclick attribute to prevent conflicts
                inner.removeAttribute('onclick');
                
                // Add JavaScript event listener
                inner.addEventListener('click', function(e) {
                    // Don't flip if clicking on the expand button
                    if (e.target.closest('.flashcard-expand-btn')) {
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const flashcardElement = this.parentElement;
                    flashcardElement.classList.toggle('flipped');
                    console.log(`🔄 Flashcard ${index + 1} flipped:`, flashcardElement.classList.contains('flipped'));
                });
            }
        });
    }

    initializeQuizzes() {
        const quizContainers = this.elements.contentArea.querySelectorAll('.quiz-container');
        console.log(`🧪 Found ${quizContainers.length} quiz/exam containers`);
        
        quizContainers.forEach(container => {
            this.setupQuizContainer(container);
        });
    }

    setupQuizContainer(container) {
        const cards = container.querySelectorAll('.quiz-card');
        const navigation = container.querySelector('.quiz-navigation');
        const resultsContainer = container.querySelector('.quiz-results-container');
        
        if (cards.length === 0) {
            console.warn('No quiz cards found in container');
            return;
        }

        // Quiz state
        const quizState = {
            currentQuestion: 0,
            totalQuestions: cards.length,
            answers: {},
            isExam: container.closest('.exam-content') !== null
        };

        // Store state on container for access
        container.quizState = quizState;

        // Initialize UI
        this.updateQuizUI(container, quizState);
        this.setupQuizNavigation(container, quizState);
        this.setupQuizInteractions(container, quizState);

        console.log(`🎯 Initialized ${quizState.isExam ? 'exam' : 'quiz'} with ${quizState.totalQuestions} questions`);
    }

    updateQuizUI(container, state) {
        const cards = container.querySelectorAll('.quiz-card');
        const navigation = container.querySelector('.quiz-navigation');

        // Hide all cards
        cards.forEach(card => card.classList.remove('active-card'));
        
        // Show current card
        if (cards[state.currentQuestion]) {
            cards[state.currentQuestion].classList.add('active-card');
        }

        // Update navigation buttons
        const prevBtn = navigation?.querySelector('#prev-question, [data-action="prev"]');
        const nextBtn = navigation?.querySelector('#next-question, [data-action="next"]');
        const submitBtn = navigation?.querySelector('#submit-quiz, [data-action="submit"]');

        if (prevBtn) {
            prevBtn.style.display = state.currentQuestion > 0 ? 'inline-block' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = state.currentQuestion < state.totalQuestions - 1 ? 'inline-block' : 'none';
        }

        if (submitBtn) {
            submitBtn.style.display = state.currentQuestion === state.totalQuestions - 1 ? 'inline-block' : 'none';
        }

        // Update progress indicator
        const progressElement = navigation?.querySelector('.quiz-progress');
        if (progressElement) {
            progressElement.textContent = `Question ${state.currentQuestion + 1} of ${state.totalQuestions}`;
        } else if (navigation) {
            // Create progress indicator if it doesn't exist
            const progress = document.createElement('div');
            progress.className = 'quiz-progress';
            progress.textContent = `Question ${state.currentQuestion + 1} of ${state.totalQuestions}`;
            navigation.appendChild(progress);
        }
    }

    setupQuizNavigation(container, state) {
        const navigation = container.querySelector('.quiz-navigation');
        if (!navigation) return;

        // Remove existing listeners by cloning
        const newNavigation = navigation.cloneNode(true);
        navigation.parentNode.replaceChild(newNavigation, navigation);

        // Add new listeners
        newNavigation.addEventListener('click', (e) => {
            const action = e.target.id || e.target.getAttribute('data-action');
            
            switch (action) {
                case 'prev-question':
                case 'prev':
                    if (state.currentQuestion > 0) {
                        state.currentQuestion--;
                        this.updateQuizUI(container, state);
                    }
                    break;
                
                case 'next-question':
                case 'next':
                    if (state.currentQuestion < state.totalQuestions - 1) {
                        state.currentQuestion++;
                        this.updateQuizUI(container, state);
                    }
                    break;
                
                case 'submit-quiz':
                case 'submit':
                    this.submitQuiz(container, state);
                    break;

                case 'try-again':
                case 'restart':
                    this.restartQuiz(container, state);
                    break;
            }
        });
    }

    setupQuizInteractions(container, state) {
        const cards = container.querySelectorAll('.quiz-card');
        
        cards.forEach((card, questionIndex) => {
            const questionNumber = questionIndex + 1;
            const options = card.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            
            options.forEach(option => {
                option.addEventListener('change', () => {
                    this.handleAnswerSelection(container, state, questionNumber, option);
                });

                // Add click handler to parent li for better UX
                const li = option.closest('li');
                if (li) {
                    li.addEventListener('click', () => {
                        if (!option.checked) {
                            option.checked = true;
                            option.dispatchEvent(new Event('change'));
                        }
                    });
                }
            });
        });
    }

    handleAnswerSelection(container, state, questionNumber, selectedOption) {
        const questionName = selectedOption.name;
        const isMultipleChoice = selectedOption.type === 'checkbox';

        if (isMultipleChoice) {
            // Handle multiple choice questions
            if (!state.answers[questionNumber]) {
                state.answers[questionNumber] = [];
            }
            
            if (selectedOption.checked) {
                if (!state.answers[questionNumber].includes(selectedOption.value)) {
                    state.answers[questionNumber].push(selectedOption.value);
                }
            } else {
                state.answers[questionNumber] = state.answers[questionNumber].filter(
                    answer => answer !== selectedOption.value
                );
            }
        } else {
            // Handle single choice questions
            state.answers[questionNumber] = selectedOption.value;
        }

        // Update visual feedback
        const card = container.querySelectorAll('.quiz-card')[questionNumber - 1];
        const allOptions = card.querySelectorAll('.options li');
        allOptions.forEach(li => li.classList.remove('selected'));
        
        const selectedLi = selectedOption.closest('li');
        if (selectedLi && selectedOption.checked) {
            selectedLi.classList.add('selected');
        }

        console.log(`📝 Question ${questionNumber} answered:`, state.answers[questionNumber]);
    }

    submitQuiz(container, state) {
        const results = this.calculateQuizResults(container, state);
        this.displayQuizResults(container, state, results);
    }

    calculateQuizResults(container, state) {
        const cards = container.querySelectorAll('.quiz-card');
        let correctAnswers = 0;
        const results = {
            totalQuestions: state.totalQuestions,
            answeredQuestions: Object.keys(state.answers).length,
            correctAnswers: 0,
            percentage: 0,
            passed: false,
            details: []
        };

        cards.forEach((card, index) => {
            const questionNumber = index + 1;
            const answerElement = card.querySelector('.answer');
            const correctAnswer = answerElement?.getAttribute('data-correct');
            const userAnswer = state.answers[questionNumber];

            if (!correctAnswer) {
                console.warn(`No correct answer found for question ${questionNumber}`);
                return;
            }

            let isCorrect = false;
            
            if (correctAnswer.includes(',')) {
                // Multiple choice question
                const correctAnswers = correctAnswer.split(',').map(a => a.trim()).sort();
                const userAnswers = (Array.isArray(userAnswer) ? userAnswer : []).sort();
                isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
            } else {
                // Single choice question
                isCorrect = correctAnswer === userAnswer;
            }

            if (isCorrect) {
                results.correctAnswers++;
            }

            results.details.push({
                question: questionNumber,
                correct: correctAnswer,
                user: userAnswer,
                isCorrect
            });
        });

        results.percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
        
        // Pass threshold: 80% for quizzes, 70% for exams
        const passThreshold = state.isExam ? 70 : 80;
        results.passed = results.percentage >= passThreshold;
        results.passThreshold = passThreshold;

        return results;
    }

    displayQuizResults(container, state, results) {
        const resultsContainer = container.querySelector('.quiz-results-container');
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }

        // Hide quiz cards and navigation
        const cards = container.querySelectorAll('.quiz-card');
        const navigation = container.querySelector('.quiz-navigation');
        
        cards.forEach(card => card.style.display = 'none');
        if (navigation) navigation.style.display = 'none';

        // Show results
        resultsContainer.innerHTML = `
            <div class="quiz-score ${results.passed ? 'pass' : 'fail'}">
                ${results.percentage}%
            </div>
            <div class="quiz-feedback">
                <h3>${results.passed ? '🎉 Congratulations!' : '📚 Keep Studying!'}</h3>
                <p>You answered ${results.correctAnswers} out of ${results.totalQuestions} questions correctly.</p>
                <p>${results.passed ? 
                    `Great job! You've passed with ${results.percentage}% (required: ${results.passThreshold}%).` :
                    `You need ${results.passThreshold}% to pass. Review the material and try again.`
                }</p>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-outline-primary" data-action="try-again">Try Again</button>
                <button class="btn btn-primary" onclick="app.navigate(1)">Continue Learning</button>
            </div>
        `;

        resultsContainer.classList.add('show');

        // Add try again functionality
        const tryAgainBtn = resultsContainer.querySelector('[data-action="try-again"]');
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                this.restartQuiz(container, state);
            });
        }

        console.log(`📊 ${state.isExam ? 'Exam' : 'Quiz'} completed: ${results.percentage}% (${results.passed ? 'PASSED' : 'FAILED'})`);
    }

    restartQuiz(container, state) {
        // Reset state
        state.currentQuestion = 0;
        state.answers = {};

        // Clear all selections
        const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        inputs.forEach(input => {
            input.checked = false;
        });

        // Remove selected classes
        const selectedOptions = container.querySelectorAll('.options li.selected');
        selectedOptions.forEach(option => option.classList.remove('selected'));

        // Reset quiz cards and navigation display
        const cards = container.querySelectorAll('.quiz-card');
        const navigation = container.querySelector('.quiz-navigation');
        const resultsContainer = container.querySelector('.quiz-results-container');

        // Remove inline styles that were set during results display
        cards.forEach(card => {
            card.style.display = '';  // Remove inline display style
        });
        
        if (navigation) {
            navigation.style.display = '';  // Remove inline display style
        }
        
        resultsContainer.classList.remove('show');

        // Update UI to show first question only
        this.updateQuizUI(container, state);

        console.log(`🔄 ${state.isExam ? 'Exam' : 'Quiz'} restarted`);
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

        // Add navigation to topic type badges and components
        this.initializeTopicNavigation();
    }

    initializeTopicNavigation() {
        // Make topic cards clickable
        const topicCards = this.elements.contentArea.querySelectorAll('.topic-card');
        
        topicCards.forEach(card => {
            const header = card.querySelector('.topic-header h3');
            if (!header) return;

            const topicTitle = header.textContent.trim();
            const topicMatch = topicTitle.match(/^(\d+)\.(\d+):/);
            
            if (topicMatch) {
                const unitNum = parseInt(topicMatch[1], 10);
                const topicNum = parseInt(topicMatch[2], 10);
                const topicIndex = (unitNum * 100) + topicNum;
                
                // Find the actual topic in our hierarchy
                const topic = this.topics.find(t => t.index === topicIndex);
                if (topic) {
                    // Make topic type badge clickable
                    const topicType = card.querySelector('.topic-type');
                    if (topicType) {
                        topicType.style.cursor = 'pointer';
                        topicType.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.loadContent(topic.url, topic.index);
                        });
                    }

                    // Make individual components clickable
                    const components = card.querySelectorAll('.component');
                    components.forEach(component => {
                        const componentText = component.textContent.trim();
                        let targetTopic = null;

                        if (componentText.includes('Main Content')) {
                            targetTopic = topic;
                        } else if (componentText.includes('Study Aids')) {
                            targetTopic = this.topics.find(t => t.index === topicIndex + 1 && t.type === 'study_aids');
                        } else if (componentText.includes('Quiz')) {
                            targetTopic = this.topics.find(t => t.index === topicIndex + 2 && t.type === 'quiz');
                        } else if (componentText.includes('Final Assessment')) {
                            targetTopic = topic; // For final exams
                        }

                        if (targetTopic) {
                            component.style.cursor = 'pointer';
                            component.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.loadContent(targetTopic.url, targetTopic.index);
                            });
                        }
                    });

                    // Make entire card clickable (navigate to main content)
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => {
                        this.loadContent(topic.url, topic.index);
                    });
                }
            }
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
            this.hideSearchResults();
            return;
        }

        try {
            // Enhanced search implementation with content indexing
            let results = [];
            const queryLower = query.toLowerCase();
            
            if (typeof lunr !== 'undefined' && this.searchIndex) {
                // Use Lunr.js for full-text search if available
                const searchResults = this.searchIndex.search(query);
                results = searchResults.map(result => {
                    const topic = this.topics.find(topic => topic.index.toString() === result.ref);
                    if (topic) {
                        topic.searchScore = result.score;
                    }
                    return topic;
                }).filter(Boolean).slice(0, 6);
            } else {
                // Fallback to simple title and content search
                results = this.topics.filter(topic => {
                    return topic.title.toLowerCase().includes(queryLower) ||
                           (topic.content && topic.content.toLowerCase().includes(queryLower));
                }).slice(0, 6);
            }

            const resultHtml = results.map(result => {
                const preview = this.generateSearchPreview(result, query);
                const highlightedTitle = this.highlightSearchTerms(result.title, query);
                
                return `
                    <div class="search-result-item" data-index="${result.index}">
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-type">${this.getTypeLabel(result.type)}</div>
                        ${preview ? `<div class="search-result-preview">${preview}</div>` : ''}
                    </div>
                `;
            }).join('');

            this.elements.searchResults.innerHTML = resultHtml || 
                '<div class="search-result-item"><div class="search-result-title">No results found</div><div class="search-result-preview">Try different keywords or browse the navigation menu.</div></div>';

            // Add click handlers to results
            this.elements.searchResults.querySelectorAll('[data-index]').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index, 10);
                    const topic = this.topics.find(t => t.index === index);
                    if (topic) {
                        this.loadContent(topic.url, index);
                        this.elements.searchInput.value = '';
                        this.elements.searchResults.innerHTML = '';
                        this.hideSearchResults();
                        this.closeMobileMenu();
                    }
                });
            });

            // Show and position search results optimally
            this.showSearchResults();
        } catch (error) {
            console.error('Search error:', error);
            this.elements.searchResults.innerHTML = 
                '<div class="search-result-item"><div class="search-result-title">Search temporarily unavailable</div></div>';
        }
    }

    generateSearchPreview(topic, query) {
        if (!topic.content) return '';
        
        const queryLower = query.toLowerCase();
        const contentLower = topic.content.toLowerCase();
        const queryIndex = contentLower.indexOf(queryLower);
        
        if (queryIndex === -1) return '';
        
        // Extract context around the match
        const contextStart = Math.max(0, queryIndex - 60);
        const contextEnd = Math.min(topic.content.length, queryIndex + query.length + 60);
        let preview = topic.content.slice(contextStart, contextEnd);
        
        // Add ellipsis if we truncated
        if (contextStart > 0) preview = '...' + preview;
        if (contextEnd < topic.content.length) preview = preview + '...';
        
        // Highlight search terms
        return this.highlightSearchTerms(preview, query);
    }

    highlightSearchTerms(text, query) {
        if (!query || query.length < 2) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-result-match">$1</span>');
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

    positionSearchResults() {
        if (!this.elements.searchResults) return;
        
        // The search results are now positioned with fixed CSS
        // This method can be used for additional positioning logic if needed
        const isMobile = window.innerWidth <= 768;
        const searchResults = this.elements.searchResults;
        
        if (isMobile) {
            // Mobile: adjust for menu state
            const mobileMenuOpen = document.querySelector('.sidebar').classList.contains('sidebar-open');
            if (mobileMenuOpen) {
                searchResults.style.top = '120px';
            } else {
                searchResults.style.top = '80px';
            }
        } else {
            // Desktop: fixed position
            searchResults.style.top = '80px';
        }
    }

    hideSearchResults() {
        if (this.elements.searchResults) {
            this.elements.searchResults.style.display = 'none';
            this.elements.searchResults.innerHTML = '';
        }
    }

    showSearchResults() {
        if (this.elements.searchResults && this.elements.searchResults.innerHTML.trim()) {
            this.elements.searchResults.style.display = 'block';
            this.positionSearchResults();
        }
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

// Global flashcard modal functions - Define immediately
window.openFlashcardModal = function(button) {
    const flashcard = button.parentElement;
    const question = flashcard.querySelector('.flashcard-front p').textContent;
    const answer = flashcard.querySelector('.flashcard-back p').innerHTML;
    
    document.getElementById('modal-question').textContent = question;
    document.getElementById('modal-answer-content').innerHTML = answer;
    document.getElementById('flashcard-modal').showModal();
};

window.closeFlashcardModal = function() {
    document.getElementById('flashcard-modal').close();
};

// Setup modal event listener when content loads
function setupFlashcardModal() {
    const modal = document.getElementById('flashcard-modal');
    if (modal && !modal.hasAttribute('data-listeners-added')) {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                window.closeFlashcardModal();
            }
        });
        modal.setAttribute('data-listeners-added', 'true');
    }
}

// Initialize the application
const app = new CloudNativeBookApp();

// Make app globally available for debugging and unit overview interactions
window.app = app;

console.log('🌐 Cloud-Native Book App loaded with hierarchical navigation');