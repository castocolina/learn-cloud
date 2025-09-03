/**
 * Search Module - ES6 Modern JavaScript
 * Handles full-text search functionality using Lunr.js
 */

export class SearchManager {
    constructor(navigationManager) {
        this.navigationManager = navigationManager;
        this.lunrIndex = null;
        this.documents = [];
        
        // DOM Elements
        this.elements = this.initializeElements();
        
        // Initialize
        this.init();
    }
    
    initializeElements() {
        return {
            searchInputs: [
                document.getElementById('search-input'),
                document.getElementById('search-input-mobile')
            ].filter(Boolean),
            searchResults: [
                document.getElementById('search-results'),
                document.getElementById('search-results-mobile')
            ].filter(Boolean)
        };
    }
    
    async init() {
        await this.buildSearchIndex();
        this.setupEventListeners();
    }
    
    async buildSearchIndex() {
        try {
            // Get all topics from navigation manager
            const topics = this.navigationManager.topics.filter(topic => topic.index >= -1);
            
            // Fetch content for each topic
            this.documents = await Promise.all(
                topics.map(async (topic) => {
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
                            content: this.cleanContent(textContent),
                            index: topic.index,
                            url: topic.url
                        };
                    } catch (e) {
                        console.warn(`Failed to fetch ${topic.url} for search index:`, e);
                        return null;
                    }
                })
            );
            
            // Filter out failed fetches
            this.documents = this.documents.filter(Boolean);
            
            // Build Lunr index
            if (typeof lunr !== 'undefined') {
                this.lunrIndex = lunr(function () {
                    this.ref('id');
                    this.field('title', { boost: 10 });
                    this.field('content');
                    
                    this.documents.forEach(doc => {
                        this.add(doc);
                    }, this);
                }.bind(this));
                
                console.log(`Search index built with ${this.documents.length} documents`);
            } else {
                console.warn('Lunr.js not available - search functionality disabled');
            }
            
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }
    
    cleanContent(content) {
        return content
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[^\w\s]/g, ' ') // Remove special chars
            .trim();
    }
    
    setupEventListeners() {
        this.elements.searchInputs.forEach((input, index) => {
            if (!input) return;
            
            const resultsContainer = this.elements.searchResults[index];
            if (!resultsContainer) return;
            
            // Search on keyup
            input.addEventListener('keyup', (e) => {
                const query = input.value.trim();
                this.handleSearch(query, resultsContainer);
            });
            
            // Focus/blur handling
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('search-focused');
            });
            
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    input.parentElement.classList.remove('search-focused');
                    resultsContainer.innerHTML = '';
                }, 200);
            });
            
            // Result click handling
            resultsContainer.addEventListener('click', (e) => {
                this.handleResultClick(e, input, resultsContainer);
            });
        });
    }
    
    handleSearch(query, resultsContainer) {
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        if (!this.lunrIndex) {
            resultsContainer.innerHTML = '<div class="search-result-item">Search not available</div>';
            return;
        }
        
        try {
            // Search with fuzzy matching
            const results = this.lunrIndex.search(`${query}~1 ${query}*`);
            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            console.warn('Search error:', error);
            resultsContainer.innerHTML = '<div class="search-result-item">Search error occurred</div>';
        }
    }
    
    displaySearchResults(results, targetElement) {
        if (results.length === 0) {
            targetElement.innerHTML = '<div class="search-result-item">No results found</div>';
            return;
        }
        
        const resultHtml = results
            .slice(0, 10) // Limit to 10 results
            .map(result => {
                const doc = this.documents.find(d => d.id === result.ref);
                if (!doc) return '';
                
                const preview = this.generatePreview(doc.content, 100);
                const relevanceScore = (result.score * 100).toFixed(1);
                
                return `
                    <div class="search-result-item" data-url="${doc.url}" data-index="${doc.index}">
                        <div class="search-result-title">${this.escapeHtml(doc.title)}</div>
                        <div class="search-result-preview">${this.escapeHtml(preview)}</div>
                        <div class="search-result-meta">Relevance: ${relevanceScore}%</div>
                    </div>
                `;
            })
            .filter(Boolean)
            .join('');
        
        targetElement.innerHTML = resultHtml;
    }
    
    generatePreview(content, maxLength) {
        if (content.length <= maxLength) return content;
        
        const truncated = content.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async handleResultClick(e, input, resultsContainer) {
        const resultItem = e.target.closest('.search-result-item');
        if (!resultItem) return;
        
        e.preventDefault();
        
        const url = resultItem.dataset.url;
        const index = parseInt(resultItem.dataset.index, 10);
        
        // Load content through navigation manager
        await this.navigationManager.loadContent(url, index);
        
        // Clear search
        input.value = '';
        resultsContainer.innerHTML = '';
        
        // Close mobile navigation if open
        this.navigationManager.closeMobileNavigation();
        
        // Remove focus from search input
        input.blur();
    }
    
    // Public API for external use
    async search(query) {
        if (!this.lunrIndex || query.length < 2) return [];
        
        try {
            const results = this.lunrIndex.search(`${query}~1 ${query}*`);
            return results.map(result => {
                const doc = this.documents.find(d => d.id === result.ref);
                return {
                    ...doc,
                    score: result.score
                };
            }).filter(Boolean);
        } catch (error) {
            console.warn('Search error:', error);
            return [];
        }
    }
    
    // Rebuild index (useful if content changes)
    async rebuildIndex() {
        console.log('Rebuilding search index...');
        await this.buildSearchIndex();
    }
}