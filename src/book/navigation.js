/**
 * Navigation Module - ES6 Modern JavaScript
 * Handles all navigation logic with clean state management
 */

export class NavigationManager {
    constructor() {
        // State
        this.topics = [];
        this.units = [];
        this.currentIndex = -1;
        
        // DOM Elements
        this.elements = this.initializeElements();
        
        // Touch handling for swipe gestures
        this.touchState = {
            startX: 0,
            startY: 0,
            isScrolling: false
        };
        
        // Initialize
        this.init();
    }
    
    initializeElements() {
        return {
            // Navigation menus
            navMenuDesktop: document.getElementById('nav-menu'),
            navMenuMobile: document.getElementById('nav-menu-mobile'),
            
            // Content area
            contentArea: document.getElementById('content-area'),
            
            // Progress indicators
            unitProgressBar: document.getElementById('unit-progress-bar'),
            unitProgressLabel: document.getElementById('unit-progress-label'),
            overallProgressBar: document.getElementById('overall-progress-bar'),
            
            // Navigation buttons
            prevButton: document.getElementById('floating-prev'),
            nextButton: document.getElementById('floating-next'),
            floatingNav: document.getElementById('floating-nav'),
            floatingPrev: document.getElementById('floating-prev'),
            floatingNext: document.getElementById('floating-next'),
            floatingProgress: document.getElementById('nav-progress'),
            
            // Indicators
            swipeLeft: document.getElementById('swipe-left'),
            swipeRight: document.getElementById('swipe-right'),
            keyboardHint: document.getElementById('keyboard-hint')
        };
    }
    
    init() {
        this.buildTopicsStructure();
        this.setupEventListeners();
        this.updateUI();
        
        // Load overview by default
        this.navigateToOverview();
    }
    
    buildTopicsStructure() {
        // Build topics array from menu structure
        const unitElements = document.querySelectorAll('#nav-menu .unit');
        let topicGlobalIndex = 0;
        
        unitElements.forEach(unitEl => {
            const unitTopics = [];
            const topicLinks = unitEl.querySelectorAll('.collapse .nav-link');
            
            topicLinks.forEach(link => {
                link.dataset.index = topicGlobalIndex;
                unitTopics.push({
                    url: link.getAttribute('href'),
                    title: link.textContent.trim(),
                    index: topicGlobalIndex,
                    element: link
                });
                topicGlobalIndex++;
            });
            
            this.units.push({
                name: unitEl.querySelector('a[data-bs-toggle="collapse"]').textContent.trim(),
                topics: unitTopics,
                element: unitEl
            });
        });
        
        // Flatten topics array
        this.topics = this.units.flatMap(unit => unit.topics);
        
        // Add overview to topics
        const overviewLink = document.querySelector('#nav-menu > .nav-item > a[href*="overview.html"]');
        if (overviewLink) {
            overviewLink.dataset.index = -1;
            this.topics.unshift({
                url: overviewLink.getAttribute('href'),
                title: overviewLink.textContent.trim(),
                index: -1,
                element: overviewLink
            });
        }
        
        // Sync mobile menu indices
        this.syncMobileMenuIndices();
    }
    
    syncMobileMenuIndices() {
        const mobileTopics = document.querySelectorAll('#nav-menu-mobile .nav-link');
        mobileTopics.forEach((link) => {
            if (link.href.includes('overview.html')) {
                link.dataset.index = -1;
            } else {
                // Find corresponding desktop link to get correct index
                const desktopLink = document.querySelector(`#nav-menu a[href="${link.getAttribute('href')}"]`);
                if (desktopLink) {
                    link.dataset.index = desktopLink.dataset.index;
                }
            }
        });
    }
    
    setupEventListeners() {
        // Navigation menu clicks
        this.setupMenuClickListeners();
        
        // Navigation buttons
        this.setupNavigationButtons();
        
        // Touch gestures
        this.setupTouchGestures();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
    }
    
    setupMenuClickListeners() {
        const menus = [this.elements.navMenuDesktop, this.elements.navMenuMobile];
        
        menus.forEach(menu => {
            if (menu) {
                menu.addEventListener('click', async (e) => {
                    const targetLink = e.target.closest('a');
                    if (targetLink && targetLink.getAttribute('href') && targetLink.getAttribute('href').includes('.html')) {
                        e.preventDefault();
                        const url = targetLink.getAttribute('href');
                        const index = parseInt(targetLink.dataset.index, 10);
                        await this.loadContent(url, index);
                        this.closeMobileNavigation();
                    }
                });
            }
        });
    }
    
    setupNavigationButtons() {
        // Original buttons (hidden)
        if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', () => this.navigate(-1));
        }
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', () => this.navigate(1));
        }
        
        // Floating buttons
        if (this.elements.floatingPrev) {
            this.elements.floatingPrev.addEventListener('click', () => this.navigate(-1));
        }
        if (this.elements.floatingNext) {
            this.elements.floatingNext.addEventListener('click', () => this.navigate(1));
        }
    }
    
    setupTouchGestures() {
        if (!this.elements.contentArea) return;
        
        this.elements.contentArea.addEventListener('touchstart', (e) => {
            this.touchState.startX = e.touches[0].clientX;
            this.touchState.startY = e.touches[0].clientY;
            this.touchState.isScrolling = false;
        }, { passive: true });
        
        this.elements.contentArea.addEventListener('touchmove', (e) => {
            if (!this.touchState.startX || this.touchState.isScrolling) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - this.touchState.startX);
            const diffY = Math.abs(currentY - this.touchState.startY);
            
            // Determine if this is vertical scrolling
            if (diffY > diffX) {
                this.touchState.isScrolling = true;
                return;
            }
            
            // Prevent default for horizontal swipes
            if (diffX > 20) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.elements.contentArea.addEventListener('touchend', (e) => {
            if (!this.touchState.startX || this.touchState.isScrolling) {
                this.resetTouchState();
                return;
            }
            
            const endX = e.changedTouches[0].clientX;
            const swipeDistance = endX - this.touchState.startX;
            const minSwipeDistance = 50;
            
            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    // Swipe right - go to previous
                    this.showSwipeIndicator('left');
                    this.navigate(-1);
                } else {
                    // Swipe left - go to next
                    this.showSwipeIndicator('right');
                    this.navigate(1);
                }
            }
            
            this.resetTouchState();
        }, { passive: true });
    }
    
    resetTouchState() {
        this.touchState.startX = 0;
        this.touchState.startY = 0;
        this.touchState.isScrolling = false;
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle navigation if not in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigate(-1);
                    this.showKeyboardHint();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigate(1);
                    this.showKeyboardHint();
                    break;
            }
        });
    }
    
    async navigate(direction) {
        let newIndex = this.currentIndex + direction;
        
        // Handle special navigation cases
        if (direction === 1) { // Next
            if (this.currentIndex === -1) {
                // From overview to first topic
                newIndex = 0;
            } else if (this.currentIndex >= this.topics.length - 1) {
                // Already at last topic
                return;
            }
        } else if (direction === -1) { // Previous
            if (this.currentIndex === 0) {
                // From first topic back to overview
                newIndex = -1;
            } else if (this.currentIndex === -1) {
                // Already at overview
                return;
            }
        }
        
        // Execute navigation
        if (newIndex === -1) {
            // Navigate to overview
            const overviewTopic = this.topics.find(topic => topic.index === -1);
            if (overviewTopic) {
                await this.loadContent(overviewTopic.url, -1);
            }
        } else if (newIndex >= 0 && newIndex < this.topics.length) {
            // Navigate to regular topic
            const nextTopic = this.topics.find(topic => topic.index === newIndex);
            if (nextTopic) {
                await this.loadContent(nextTopic.url, newIndex);
            }
        }
    }
    
    async navigateToOverview() {
        const overviewTopic = this.topics.find(topic => topic.index === -1);
        if (overviewTopic) {
            await this.loadContent(overviewTopic.url, -1);
        }
    }
    
    async loadContent(url, index) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            this.elements.contentArea.innerHTML = html;
            this.currentIndex = index;
            
            this.updateUI();
            this.initializeContentFeatures();
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.elements.contentArea.innerHTML = `
                <div class="text-center" style="padding: var(--space-xl);">
                    <h2>Content Not Found</h2>
                    <p>Sorry, the requested content could not be loaded.</p>
                    <button onclick="window.navigationManager.navigateToOverview()" class="floating-nav-btn">
                        Return to Overview
                    </button>
                </div>
            `;
        }
    }
    
    updateUI() {
        this.updateActiveLinks();
        this.updateProgressBars();
        this.updateNavigationButtons();
    }
    
    updateActiveLinks() {
        // Reset all links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Set active link
        const activeLinks = document.querySelectorAll(`[data-index='${this.currentIndex}']`);
        activeLinks.forEach(link => {
            link.classList.add('active');
            
            // Expand parent unit if needed
            const parentCollapse = link.closest('.collapse');
            if (parentCollapse && !parentCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(parentCollapse, { toggle: false });
                bsCollapse.show();
            }
        });
    }
    
    updateProgressBars() {
        // Get only the actual content topics (index >= 0, excluding overview)
        const contentTopics = this.topics.filter(topic => topic.index >= 0);
        const totalTopics = contentTopics.length;
        
        let overallCompleted, overallPercentage, overallText;
        
        if (this.currentIndex === -1) {
            // Overview page - no progress yet
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
                // Fallback - shouldn't happen
                overallCompleted = 0;
                overallPercentage = 0;
                overallText = `0/${totalTopics} (0%)`;
            }
        }
        
        // Update overall progress bar
        if (this.elements.overallProgressBar) {
            this.elements.overallProgressBar.style.width = `${overallPercentage}%`;
            const textSpan = this.elements.overallProgressBar.querySelector('.progress-text');
            if (textSpan) {
                textSpan.textContent = overallText;
            }
        }
        
        // Update unit progress
        this.updateUnitProgress();
        
        // Update floating navigation progress
        if (this.elements.floatingProgress) {
            const currentDisplay = this.currentIndex === -1 ? 0 : overallCompleted;
            this.elements.floatingProgress.textContent = `${currentDisplay}/${totalTopics}`;
        }
    }
    
    updateUnitProgress() {
        if (!this.elements.unitProgressBar || !this.elements.unitProgressLabel) return;
        
        // Get text span element
        const unitTextSpan = this.elements.unitProgressBar.querySelector('.progress-text');
        
        if (this.currentIndex === -1) {
            // Overview page - no unit progress
            this.elements.unitProgressBar.style.width = '0%';
            if (unitTextSpan) unitTextSpan.textContent = 'Select a topic to begin';
            this.elements.unitProgressLabel.textContent = 'Unit Progress';
        } else if (this.currentIndex >= 0) {
            // Find the current unit that contains this topic
            const currentUnit = this.units.find(unit => 
                unit.topics.some(topic => topic.index === this.currentIndex)
            );
            
            if (currentUnit) {
                // Calculate position within the unit
                const unitTopics = currentUnit.topics;
                const currentTopicPositionInUnit = unitTopics.findIndex(topic => topic.index === this.currentIndex);
                
                if (currentTopicPositionInUnit >= 0) {
                    const totalInUnit = unitTopics.length;
                    const completedInUnit = currentTopicPositionInUnit + 1;
                    const unitProgressPercentage = (completedInUnit / totalInUnit) * 100;
                    const unitText = `${completedInUnit}/${totalInUnit} (${Math.round(unitProgressPercentage)}%)`;
                    
                    this.elements.unitProgressBar.style.width = `${unitProgressPercentage}%`;
                    if (unitTextSpan) unitTextSpan.textContent = unitText;
                    this.elements.unitProgressLabel.textContent = currentUnit.name;
                } else {
                    // Fallback - topic not found in unit
                    this.elements.unitProgressBar.style.width = '0%';
                    if (unitTextSpan) unitTextSpan.textContent = '0%';
                    this.elements.unitProgressLabel.textContent = currentUnit.name;
                }
            } else {
                // Topic doesn't belong to any unit - reset
                this.elements.unitProgressBar.style.width = '0%';
                if (unitTextSpan) unitTextSpan.textContent = '0%';
                this.elements.unitProgressLabel.textContent = 'Unit Progress';
            }
        }
    }
    
    updateNavigationButtons() {
        const contentTopics = this.topics.filter(t => t.index >= 0);
        const isOverview = this.currentIndex === -1;
        const currentTopicPosition = contentTopics.findIndex(topic => topic.index === this.currentIndex);
        const isLastTopic = currentTopicPosition === contentTopics.length - 1;
        
        // Update button states
        [this.elements.prevButton, this.elements.floatingPrev].forEach(btn => {
            if (btn) btn.disabled = isOverview;
        });
        
        [this.elements.nextButton, this.elements.floatingNext].forEach(btn => {
            if (btn) btn.disabled = isLastTopic && this.currentIndex >= 0;
        });
        
        // Show/hide floating nav
        if (this.elements.floatingNav) {
            if (this.topics.length > 0) {
                this.elements.floatingNav.classList.remove('hidden');
            } else {
                this.elements.floatingNav.classList.add('hidden');
            }
        }
    }
    
    initializeContentFeatures() {
        // Initialize Mermaid diagrams
        if (typeof mermaid !== 'undefined') {
            mermaid.run({ nodes: this.elements.contentArea.querySelectorAll('.mermaid') });
        }
        
        // Initialize Prism syntax highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(this.elements.contentArea);
        }
        
        // Initialize any other content-specific features
        this.initializeFlashcards();
        this.initializeQuizzes();
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
        // Quiz initialization logic here
        // This would handle quiz navigation and scoring
    }
    
    showSwipeIndicator(direction) {
        const indicator = direction === 'left' ? this.elements.swipeLeft : this.elements.swipeRight;
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 300);
        }
    }
    
    showKeyboardHint() {
        if (this.elements.keyboardHint) {
            this.elements.keyboardHint.classList.add('show');
            setTimeout(() => {
                this.elements.keyboardHint.classList.remove('show');
            }, 2000);
        }
    }
    
    closeMobileNavigation() {
        const mobileNavCollapse = document.getElementById('mobileNavigation');
        if (mobileNavCollapse && mobileNavCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(mobileNavCollapse) || 
                             new bootstrap.Collapse(mobileNavCollapse, { toggle: false });
            bsCollapse.hide();
        }
    }
}