/**
 * SearchEngine - Full-text search across all SOP content
 * Provides instant search with highlighting and filtering
 */

export class SearchEngine {
    constructor(app) {
        this.app = app;
        this.searchIndex = new Map();
        this.searchResults = [];
        this.searchActive = false;
    }
    
    /**
     * Initialize search engine
     */
    init() {
        // Build search index
        this.buildIndex();
        
        // Setup search UI
        this.setupSearchUI();
        
        // Setup keyboard shortcuts
        this.setupShortcuts();
        
        console.log('✅ Search engine initialized');
    }
    
    /**
     * Build search index from content
     */
    buildIndex() {
        const sections = this.app.config.navigation?.sections || [];
        
        sections.forEach(section => {
            // Index section metadata
            this.indexContent(section.id, {
                title: section.title,
                type: 'section',
                keywords: section.keywords || [],
                content: section.description || ''
            });
            
            // Index section content (would normally load from JSON)
            const content = this.app.content?.data?.[section.id];
            if (content) {
                this.indexContent(`${section.id}_content`, {
                    title: content.title,
                    type: 'content',
                    sectionId: section.id,
                    content: this.extractText(content.content || '')
                });
            }
        });
        
        console.log(`🔍 Indexed ${this.searchIndex.size} items`);
    }
    
    /**
     * Index content item
     */
    indexContent(id, data) {
        // Create searchable text
        const searchableText = [
            data.title,
            data.content,
            ...(data.keywords || [])
        ].join(' ').toLowerCase();
        
        this.searchIndex.set(id, {
            ...data,
            id,
            searchableText,
            tokens: this.tokenize(searchableText)
        });
    }
    
    /**
     * Tokenize text for searching
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(token => token.length > 2);
    }
    
    /**
     * Extract text from HTML
     */
    extractText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
    
    /**
     * Setup search UI
     */
    setupSearchUI() {
        const searchContainer = document.getElementById('search-container');
        if (!searchContainer) return;
        
        // Create search interface
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <div class="search-input-group">
                    <input 
                        type="text" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Search SOP content (Ctrl+K)"
                        aria-label="Search"
                    >
                    <button 
                        id="search-clear" 
                        class="search-clear" 
                        style="display:none;"
                        aria-label="Clear search"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                    <i class="fas fa-search search-icon"></i>
                </div>
                <div id="search-results" class="search-results" style="display:none;"></div>
            </div>
        `;
        
        // Setup event listeners
        this.setupSearchListeners();
    }
    
    /**
     * Setup search event listeners
     */
    setupSearchListeners() {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');
        const results = document.getElementById('search-results');
        
        if (!input) return;
        
        // Handle input
        let searchTimeout;
        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length > 0) {
                clearBtn.style.display = 'block';
                searchTimeout = setTimeout(() => {
                    this.search(query);
                }, 300); // Debounce
            } else {
                this.clearSearch();
            }
        });
        
        // Handle clear
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                this.clearSearch();
                input.focus();
            });
        }
        
        // Handle result clicks
        if (results) {
            results.addEventListener('click', (e) => {
                const resultItem = e.target.closest('.search-result-item');
                if (resultItem) {
                    const sectionId = resultItem.dataset.section;
                    if (sectionId) {
                        this.app.navigate(sectionId);
                        this.clearSearch();
                    }
                }
            });
        }
        
        // Handle escape key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
                input.blur();
            }
        });
    }
    
    /**
     * Perform search
     */
    search(query) {
        console.log(`🔍 Searching for: ${query}`);
        
        const queryTokens = this.tokenize(query);
        const results = [];
        
        // Search through index
        this.searchIndex.forEach((item, id) => {
            const score = this.calculateScore(queryTokens, item);
            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    highlights: this.getHighlights(query, item)
                });
            }
        });
        
        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        // Limit results
        this.searchResults = results.slice(0, 10);
        
        // Display results
        this.displayResults(query);
        
        // Emit event
        this.app.emit('search:performed', {
            query,
            resultCount: this.searchResults.length
        });
    }
    
    /**
     * Calculate search score
     */
    calculateScore(queryTokens, item) {
        let score = 0;
        
        queryTokens.forEach(token => {
            // Check title (highest weight)
            if (item.title?.toLowerCase().includes(token)) {
                score += 10;
            }
            
            // Check keywords (medium weight)
            if (item.keywords?.some(k => k.toLowerCase().includes(token))) {
                score += 5;
            }
            
            // Check content (lower weight)
            if (item.searchableText?.includes(token)) {
                score += 1;
            }
        });
        
        return score;
    }
    
    /**
     * Get text highlights
     */
    getHighlights(query, item) {
        const text = item.content || '';
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        
        if (index === -1) return text.substring(0, 150) + '...';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 100);
        
        let highlight = text.substring(start, end);
        
        // Add ellipsis
        if (start > 0) highlight = '...' + highlight;
        if (end < text.length) highlight = highlight + '...';
        
        // Highlight query
        const regex = new RegExp(`(${query})`, 'gi');
        highlight = highlight.replace(regex, '<mark>$1</mark>');
        
        return highlight;
    }
    
    /**
     * Display search results
     */
    displayResults(query) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (this.searchResults.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                    <small>Try different keywords or check spelling</small>
                </div>
            `;
        } else {
            const resultsHTML = this.searchResults.map(result => `
                <div class="search-result-item" data-section="${result.sectionId || result.id}">
                    <div class="search-result-header">
                        <i class="${this.getResultIcon(result.type)}"></i>
                        <h4>${result.title}</h4>
                    </div>
                    <div class="search-result-content">
                        ${result.highlights}
                    </div>
                    <div class="search-result-meta">
                        <span class="result-type">${result.type}</span>
                        <span class="result-score">Score: ${result.score}</span>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = `
                <div class="search-results-header">
                    <span>${this.searchResults.length} results for "${query}"</span>
                </div>
                <div class="search-results-list">
                    ${resultsHTML}
                </div>
            `;
        }
        
        container.style.display = 'block';
        this.searchActive = true;
    }
    
    /**
     * Get icon for result type
     */
    getResultIcon(type) {
        const icons = {
            section: 'fas fa-folder',
            content: 'fas fa-file-alt',
            checklist: 'fas fa-tasks',
            template: 'fas fa-file-download'
        };
        return icons[type] || 'fas fa-file';
    }
    
    /**
     * Clear search
     */
    clearSearch() {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');
        const results = document.getElementById('search-results');
        
        if (input) input.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        if (results) {
            results.style.display = 'none';
            results.innerHTML = '';
        }
        
        this.searchResults = [];
        this.searchActive = false;
        
        this.app.emit('search:cleared');
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Ctrl+/ for search
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }
    
    /**
     * Focus search input
     */
    focusSearch() {
        const input = document.getElementById('search-input');
        if (input) {
            input.focus();
            input.select();
        }
    }
    
    /**
     * Add content to search index
     */
    addToIndex(id, data) {
        this.indexContent(id, data);
    }
    
    /**
     * Remove from search index
     */
    removeFromIndex(id) {
        this.searchIndex.delete(id);
    }
    
    /**
     * Rebuild search index
     */
    rebuildIndex() {
        this.searchIndex.clear();
        this.buildIndex();
    }
}