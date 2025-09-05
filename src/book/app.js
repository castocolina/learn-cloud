/**
 * Cloud-Native Book Application
 * Modern ES6 Single Page Application with Hierarchical Navigation
 */

import { initializeFlashcards, setupGlobalFlashcardModal } from './study-aids.js';
import { initializeQuizzes } from './quiz.js';
import { SearchManager } from './search.js';

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
            this.setupUniversalModal();
            this.initializeLibraries();
            this.setupGlobalErrorHandling();
            
            this.searchManager = new SearchManager(this);
            this.loadBookOverview();
            
            setupGlobalFlashcardModal();
            
            // Expose global instance for use by other modules
            window.navigationManager = this;
            
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
            unitProgress: document.getElementById('unit-progress-bar'),
            overallProgress: document.getElementById('overall-progress-bar'),
            navProgress: document.getElementById('nav-progress'),
            
            // Navigation buttons
            prevBtn: document.getElementById('floating-prev'),
            nextBtn: document.getElementById('floating-next'),
            floatingNav: document.getElementById('floating-nav'),
            
            // Sticky mini header
            stickyMiniHeader: document.getElementById('sticky-mini-header'),
            miniTitleText: document.getElementById('mini-title-text')
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

        

        // Navigation buttons
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.navigate(1));
        }
        
        // Mermaid diagram expand functionality
        this.setupMermaidExpansion();

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

        // Setup sticky mini header scroll listener
        this.setupStickyMiniHeader();
    }

    setupUniversalModal() {
        const modal = document.getElementById('universal-modal');
        const closeBtn = modal?.querySelector('.modal-close-btn');
        
        if (!modal || !closeBtn) {
            console.warn('Universal modal elements not found');
            return;
        }
        
        // Close button click handler
        const closeHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeUniversalModal();
        };
        
        closeBtn.addEventListener('click', closeHandler);
        closeBtn.addEventListener('touchend', closeHandler);
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeUniversalModal();
            }
        });
        
        // Store modal reference for easy access
        this.universalModal = modal;
    }

    setupStickyMiniHeader() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Find topic header in current content
            const topicHeader = this.elements.contentArea.querySelector('.topic-header');
            const topicTitle = this.elements.contentArea.querySelector('.topic-title');
            
            if (topicHeader && topicTitle && this.elements.stickyMiniHeader && this.elements.miniTitleText) {
                // Get the topic header's bottom position relative to the viewport
                const headerRect = topicHeader.getBoundingClientRect();
                const headerBottom = headerRect.bottom;
                
                // Show sticky header when the topic header is completely out of view
                if (headerBottom < 0 && currentScrollY > lastScrollY) {
                    // Scrolling down and header is out of view
                    this.elements.miniTitleText.textContent = topicTitle.textContent;
                    this.elements.stickyMiniHeader.classList.add('visible');
                } else if (headerBottom > 60) {
                    // Header is back in view
                    this.elements.stickyMiniHeader.classList.remove('visible');
                }
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
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
            // Clean up previous sticky headers
            this.cleanupStickyHeaders();
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            this.elements.contentArea.innerHTML = html;
            this.currentIndex = index;

            this.updateUI();
            await this.initializeContentFeatures();

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
        // Get only content topics (excluding overview)
        const contentTopics = this.topics.filter(topic => topic.index >= 0);
        const totalTopics = contentTopics.length;
        
        let overallCompleted, overallPercentage, overallText;

        if (this.currentIndex === -1) {
            // Book overview page - no progress yet
            overallCompleted = 0;
            overallPercentage = 0;
            overallText = `0/${totalTopics} (0%)`;
        } else {
            // Regular topics - find position in contentTopics array
            const topicPosition = contentTopics.findIndex(topic => topic.index === this.currentIndex);
            if (topicPosition >= 0) {
                overallCompleted = topicPosition + 1;
                overallPercentage = totalTopics > 0 ? (overallCompleted / totalTopics) * 100 : 0;
                overallText = `${overallCompleted}/${totalTopics} (${Math.round(overallPercentage)}%)`;
            } else {
                // Fallback
                overallCompleted = 0;
                overallPercentage = 0;
                overallText = `0/${totalTopics} (0%)`;
            }
        }

        // Update overall progress bar
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

        // Get unit progress label element
        const unitProgressLabel = document.getElementById('unit-progress-label');
        const unitTextSpan = this.elements.unitProgress.querySelector('.progress-text');

        if (this.currentIndex === -1) {
            // Overview page - no unit progress
            this.elements.unitProgress.style.width = '0%';
            if (unitTextSpan) unitTextSpan.textContent = 'Select a topic to begin';
            if (unitProgressLabel) unitProgressLabel.textContent = 'Unit Progress';
            return;
        }

        // Find the current topic and its unit
        const currentTopic = this.topics.find(topic => topic.index === this.currentIndex);
        if (!currentTopic) {
            this.elements.unitProgress.style.width = '0%';
            if (unitTextSpan) unitTextSpan.textContent = '0%';
            if (unitProgressLabel) unitProgressLabel.textContent = 'Unit Progress';
            return;
        }

        // Find the unit that contains this topic
        const currentUnit = this.units.find(unit => unit.number === currentTopic.unit);
        if (currentUnit) {
            // Calculate position within the unit
            const unitTopics = currentUnit.topics;
            const currentTopicPositionInUnit = unitTopics.findIndex(topic => topic.index === this.currentIndex);
            
            if (currentTopicPositionInUnit >= 0) {
                const totalInUnit = unitTopics.length;
                const completedInUnit = currentTopicPositionInUnit + 1;
                const unitProgressPercentage = (completedInUnit / totalInUnit) * 100;
                const unitText = `${completedInUnit}/${totalInUnit} (${Math.round(unitProgressPercentage)}%)`;
                
                this.elements.unitProgress.style.width = `${unitProgressPercentage}%`;
                if (unitTextSpan) unitTextSpan.textContent = unitText;
                if (unitProgressLabel) unitProgressLabel.textContent = currentUnit.name;
            } else {
                // Fallback
                this.elements.unitProgress.style.width = '0%';
                if (unitTextSpan) unitTextSpan.textContent = '0%';
                if (unitProgressLabel) unitProgressLabel.textContent = currentUnit.name;
            }
        } else {
            // Topic doesn't belong to any unit - reset
            this.elements.unitProgress.style.width = '0%';
            if (unitTextSpan) unitTextSpan.textContent = '0%';
            if (unitProgressLabel) unitProgressLabel.textContent = 'Unit Progress';
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

    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
        
        // Handle global errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
    }

    

    async initializeContentFeatures() {
        // Re-run Mermaid on new content with error handling
        if (typeof mermaid !== 'undefined') {
            try {
                const mermaidNodes = this.elements.contentArea.querySelectorAll('.mermaid');
                if (mermaidNodes.length > 0) {
                    // Extract content from nested script tags if present
                    mermaidNodes.forEach((node) => {
                        const scriptTag = node.querySelector('script[type="text/plain"]');
                        if (scriptTag) {
                            // Replace the content with the script content
                            node.textContent = scriptTag.textContent.trim();
                        }
                    });
                    
                    await mermaid.run({ nodes: mermaidNodes });
                }
            } catch (error) {
                console.error('❌ Mermaid initialization failed:', error);
                console.error('📋 Mermaid error details:', {
                    message: error.message || 'Unknown error',
                    stack: error.stack || 'No stack trace available'
                });
                
                // Try to identify which diagram failed
                const mermaidNodes = this.elements.contentArea.querySelectorAll('.mermaid');
                mermaidNodes.forEach((node, index) => {
                    const diagramText = node.textContent.trim();
                    console.log(`📊 Diagram ${index + 1} content:`, diagramText.substring(0, 100) + '...');
                });
            }
        }

        // Re-run Prism on new content
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(this.elements.contentArea);
        }

        // Initialize Mermaid interactivity for new content
        this.initializeMermaidInteractivity();

        // Initialize any interactive content
        initializeFlashcards(this.elements.contentArea);
        initializeQuizzes(this.elements.contentArea);
        this.initializeUnitOverviewFeatures();
        
        
        
        // Initialize sticky header functionality
        this.initializeStickyHeader();
    }

    initializeStickyHeader() {
        // Find any title that could be sticky (topic, quiz, study aids)
        let titleElement = null;
        let headerElement = null;
        
        // Check for different page types
        const topicTitle = this.elements.contentArea.querySelector('.topic-title');
        const quizTitle = this.elements.contentArea.querySelector('.quiz-header h2, .exam-header h1');
        const studyAidsTitle = this.elements.contentArea.querySelector('.study-aids-header h2');
        const unitTitle = this.elements.contentArea.querySelector('.unit-header h1');
        
        if (topicTitle) {
            titleElement = topicTitle;
            headerElement = this.elements.contentArea.querySelector('.topic-header');
        } else if (quizTitle) {
            titleElement = quizTitle;
            headerElement = this.elements.contentArea.querySelector('.quiz-header, .exam-header');
        } else if (studyAidsTitle) {
            titleElement = studyAidsTitle;
            headerElement = this.elements.contentArea.querySelector('.study-aids-header');
        } else if (unitTitle) {
            titleElement = unitTitle;
            headerElement = this.elements.contentArea.querySelector('.unit-header');
        }
        
        if (!titleElement || !headerElement) {
            // Hide sticky header if no title found
            if (this.elements.stickyMiniHeader) {
                this.elements.stickyMiniHeader.classList.remove('visible');
            }
            return;
        }

        // Use the existing sticky mini header from HTML
        const stickyMiniHeader = this.elements.stickyMiniHeader;
        const miniTitleText = this.elements.miniTitleText;
        
        if (!stickyMiniHeader || !miniTitleText) {
            return; // Elements not found
        }

        // Update the mini header text with original title (preserve all prefixes)
        const titleText = titleElement.textContent.trim();
        miniTitleText.textContent = titleText;

        // Setup scroll detection - show mini header when main title is not visible
        let isVisible = false;
        const handleScroll = () => {
            const headerRect = headerElement.getBoundingClientRect();
            
            // Improved scroll detection with responsive thresholds
            const isMobile = window.innerWidth <= 768;
            const threshold = isMobile ? 100 : 120; // Mobile: below mobile header + progress, Desktop: below progress bar
            
            // Use header bottom position for more consistent detection
            // This ensures mini header appears when the main header is scrolled out of visible area
            const shouldShow = headerRect.bottom <= threshold && headerRect.top < 0;
            
            // Desktop: No sticky detection needed - titles are not sticky anymore
            // Only the mini header provides sticky behavior
            
            if (shouldShow && !isVisible) {
                stickyMiniHeader.classList.add('visible');
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                stickyMiniHeader.classList.remove('visible');
                isVisible = false;
            }
        };

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Store reference for cleanup
        if (!this.stickyHeaderCleanup) {
            this.stickyHeaderCleanup = [];
        }
        this.stickyHeaderCleanup.push(() => {
            window.removeEventListener('scroll', handleScroll);
            stickyMiniHeader.classList.remove('visible');
        });
    }

    cleanupStickyHeaders() {
        // Clean up existing sticky headers
        if (this.stickyHeaderCleanup) {
            this.stickyHeaderCleanup.forEach(cleanup => cleanup());
            this.stickyHeaderCleanup = [];
        }
        
        // Hide the sticky mini header (don't remove it, just hide it)
        if (this.elements.stickyMiniHeader) {
            this.elements.stickyMiniHeader.classList.remove('visible');
        }
        
        // Remove any dynamically created sticky topic headers
        const existingTopicHeaders = document.querySelectorAll('.sticky-topic-header');
        existingTopicHeaders.forEach(header => header.remove());
    }

    

    

    initializeUnitOverviewFeatures() {
        // Initialize unit overview page features
        const startButtons = this.elements.contentArea.querySelectorAll('.btn-start');
        const continueButtons = this.elements.contentArea.querySelectorAll('.btn-continue');

        startButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Extract unit number from data-unit attribute first, fallback to onclick
                const unitFromData = btn.getAttribute('data-unit');
                if (unitFromData) {
                    this.startUnit(parseInt(unitFromData, 10));
                    return;
                }
                // Fallback for legacy onclick attributes
                const unitMatch = btn.getAttribute('onclick')?.match(/startUnit\((\d+)\)/);
                if (unitMatch) {
                    this.startUnit(parseInt(unitMatch[1], 10));
                }
            });
        });

        continueButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Extract unit number from data-unit attribute first, fallback to onclick
                const unitFromData = btn.getAttribute('data-unit');
                if (unitFromData) {
                    this.continueUnit(parseInt(unitFromData, 10));
                    return;
                }
                // Fallback for legacy onclick attributes
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
                        } else if (componentText.includes('Hands-on Project')) {
                            targetTopic = topic; // For projects, navigate to main content
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

    setupMermaidExpansion() {
        // Only setup global listeners once
        if (!this.mermaidListenersSetup) {
            // Set up event delegation from the document level
            document.addEventListener('click', (e) => {
                // Check if clicked element is within a Mermaid diagram
                const mermaidPre = e.target.closest('pre.mermaid');
                if (mermaidPre && !mermaidPre.classList.contains('modal-diagram')) {
                    // Only open modal if it's not already a modal diagram
                    e.preventDefault();
                    e.stopPropagation();
                    this.openMermaidModal(mermaidPre);
                }
            });

            // ESC key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const modal = document.getElementById('universal-modal');
                    if (modal && modal.open) {
                        e.preventDefault();
                        this.closeUniversalModal();
                    }
                }
            });

            this.mermaidListenersSetup = true;
        }

        // Setup Mermaid interactivity after content loads
        this.initializeMermaidInteractivity();
    }

    initializeMermaidInteractivity() {
        const mermaidElements = this.elements.contentArea.querySelectorAll('pre.mermaid');
        
        mermaidElements.forEach((pre) => {
            // Skip if already processed or is a modal diagram
            if (pre.hasAttribute('data-interactive') || pre.classList.contains('modal-diagram')) {
                return;
            }

            // Make diagram clickable - styles are handled by CSS
            pre.setAttribute('data-interactive', 'true');
        });
    }

    openUniversalModal(type, content) {
        const modal = this.universalModal;
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) {
            console.error('Universal modal elements not found');
            return;
        }
        
        // Configure modal based on type
        switch (type) {
            case 'flashcard': {
                modalTitle.textContent = content.question || 'Flashcard';
                modalBody.innerHTML = `
                    <div class="modal-answer">
                        <h4>Answer</h4>
                        <div>${content.answer || 'No answer provided'}</div>
                    </div>
                `;
                break;
            }
                
            case 'diagram': {
                modalTitle.textContent = 'Diagram Viewer';
                modalBody.innerHTML = '<div class="modal-diagram"></div>';
                
                const diagramContainer = modalBody.querySelector('.modal-diagram');
                const mermaidContent = content.cloneNode(true);
                
                // Remove interactivity from cloned diagram
                mermaidContent.style.cursor = 'default';
                mermaidContent.title = '';
                mermaidContent.removeAttribute('data-interactive');
                mermaidContent.classList.add('modal-diagram');
                
                // Remove any hover effects and scale
                mermaidContent.style.transform = 'none';
                mermaidContent.style.transition = 'none';
                
                diagramContainer.appendChild(mermaidContent);
                
                // Re-render Mermaid in modal if needed
                if (typeof mermaid !== 'undefined') {
                    mermaid.init(undefined, mermaidContent);
                }
                break;
            }
                
            default: {
                modalTitle.textContent = content.title || 'Modal';
                modalBody.innerHTML = content.body || 'No content provided';
                break;
            }
        }
        
        // Show modal using native dialog API
        modal.showModal();
        
        // Focus the close button for accessibility
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            setTimeout(() => {
                closeBtn.focus();
            }, 100);
        }
    }
    
    // Convenience methods for specific modal types
    openMermaidModal(mermaidPre) {
        this.openUniversalModal('diagram', mermaidPre);
    }
    
    openFlashcardModal(question, answer) {
        this.openUniversalModal('flashcard', { question, answer });
    }

    closeUniversalModal() {
        if (this.universalModal && this.universalModal.open) {
            this.universalModal.close();
        }
    }
    
    // Legacy methods for backward compatibility
    closeMermaidModal() {
        this.closeUniversalModal();
    }
}



// Initialize the application
const app = new CloudNativeBookApp();

// Make app globally available for debugging and unit overview interactions
window.app = app;

console.log('🌐 Cloud-Native Book App loaded with hierarchical navigation');