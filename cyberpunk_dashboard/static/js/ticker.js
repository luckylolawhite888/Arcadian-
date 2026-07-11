// Arcadian Media - News Ticker System

class NewsTicker {
    constructor() {
        this.tickerContent = document.querySelector('.ticker-content');
        this.tickerItems = [];
        this.currentIndex = 0;
        this.isPaused = false;
        
        this.init();
    }
    
    init() {
        console.log('News Ticker System Initialized');
        
        // Load initial ticker items
        this.loadTickerItems();
        
        // Set up periodic updates
        setInterval(() => this.updateTicker(), 60000); // Update every minute
        
        // Pause on hover
        if (this.tickerContent) {
            this.tickerContent.addEventListener('mouseenter', () => this.pause());
            this.tickerContent.addEventListener('mouseleave', () => this.resume());
        }
    }
    
    loadTickerItems() {
        // Default items
        this.tickerItems = [
            '📰 Loading live news feed...',
            '⚡ Arcadian Media Dashboard Online',
            '🦊 Powered by Lola AI Assistant',
            '🌐 Connected to global data networks',
            '🔒 Secure connection established'
        ];
        
        // Try to fetch live news
        this.fetchLiveNews();
        
        // Update display
        this.updateTickerDisplay();
    }
    
    async fetchLiveNews() {
        try {
            const response = await fetch('/api/ticker-news');
            if (response.ok) {
                const data = await response.json();
                if (data.news && Array.isArray(data.news)) {
                    // Add news items to ticker
                    data.news.forEach(item => {
                        this.tickerItems.push(`📰 ${item}`);
                    });
                    
                    // Update display with new items
                    this.updateTickerDisplay();
                }
            }
        } catch (error) {
            console.log('Could not fetch live news for ticker:', error);
            // Use fallback items
            this.addFallbackItems();
        }
    }
    
    addFallbackItems() {
        const fallbackItems = [
            '⚡ Cyberpunk interface active',
            '🕐 Next update: 11:00 AM London',
            '🌤️ Weather data streaming',
            '✈️ Travel deals monitoring',
            '📊 System performance: Optimal',
            '🔮 Horoscope data loaded',
            '⚽ Sports news feed active',
            '💨 Air quality sensors online',
            '📈 Market data processing',
            '🎯 Personal briefing ready'
        ];
        
        // Add some random fallback items
        const randomItems = [...fallbackItems]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        
        this.tickerItems = [...this.tickerItems, ...randomItems];
        this.updateTickerDisplay();
    }
    
    updateTickerDisplay() {
        if (!this.tickerContent) return;
        
        // Clear current content
        this.tickerContent.innerHTML = '';
        
        // Add all items with spacing
        this.tickerItems.forEach((item, index) => {
            const span = document.createElement('span');
            span.className = 'ticker-item';
            span.textContent = item;
            
            // Add data attribute for tracking
            span.setAttribute('data-index', index);
            
            this.tickerContent.appendChild(span);
            
            // Add separator (except for last item)
            if (index < this.tickerItems.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'ticker-separator';
                separator.innerHTML = ' • ';
                this.tickerContent.appendChild(separator);
            }
        });
        
        // Calculate total width for animation
        this.setupAnimation();
    }
    
    setupAnimation() {
        if (!this.tickerContent) return;
        
        const totalWidth = this.tickerContent.scrollWidth;
        const containerWidth = this.tickerContent.parentElement.clientWidth;
        
        // Only animate if content is wider than container
        if (totalWidth > containerWidth) {
            const duration = (totalWidth / 50) * 1000; // 50px per second
            
            this.tickerContent.style.animation = `ticker-scroll ${duration}ms linear infinite`;
        } else {
            this.tickerContent.style.animation = 'none';
        }
    }
    
    updateTicker() {
        // Rotate items - move first to last
        if (this.tickerItems.length > 1) {
            const firstItem = this.tickerItems.shift();
            this.tickerItems.push(firstItem);
            this.updateTickerDisplay();
        }
        
        // Occasionally fetch new news
        if (Math.random() < 0.3) { // 30% chance each minute
            this.fetchLiveNews();
        }
    }
    
    addItem(item) {
        this.tickerItems.push(item);
        
        // If ticker was empty, start animation
        if (this.tickerItems.length === 1) {
            this.updateTickerDisplay();
        } else {
            // Just add to the end
            this.updateTickerDisplay();
        }
        
        return this.tickerItems.length;
    }
    
    addBreakingNews(news) {
        const breakingItem = `🚨 BREAKING: ${news}`;
        
        // Add at the beginning for immediate display
        this.tickerItems.unshift(breakingItem);
        
        // Limit total items
        if (this.tickerItems.length > 20) {
            this.tickerItems = this.tickerItems.slice(0, 20);
        }
        
        this.updateTickerDisplay();
        
        // Flash effect
        this.flashTicker();
        
        return breakingItem;
    }
    
    flashTicker() {
        const ticker = document.querySelector('.news-ticker');
        if (!ticker) return;
        
        // Add flash class
        ticker.classList.add('ticker-flash');
        
        // Remove after animation
        setTimeout(() => {
            ticker.classList.remove('ticker-flash');
        }, 1000);
    }
    
    pause() {
        if (this.isPaused) return;
        
        this.isPaused = true;
        if (this.tickerContent) {
            this.tickerContent.style.animationPlayState = 'paused';
        }
    }
    
    resume() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        if (this.tickerContent) {
            this.tickerContent.style.animationPlayState = 'running';
        }
    }
    
    clear() {
        this.tickerItems = [];
        this.updateTickerDisplay();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsTicker = new NewsTicker();
    
    // Add CSS for ticker flash
    const style = document.createElement('style');
    style.textContent = `
        .ticker-flash {
            animation: ticker-flash 1s ease;
        }
        
        @keyframes ticker-flash {
            0%, 100% { background: linear-gradient(90deg, var(--matrix-black), var(--cyber-black)); }
            50% { background: linear-gradient(90deg, #ff0000, var(--primary-orange)); }
        }
        
        .ticker-separator {
            color: var(--text-dim);
            margin: 0 10px;
        }
    `;
    document.head.appendChild(style);
});

// Export for use in main.js
window.TickerSystem = {
    addItem: (item) => window.newsTicker?.addItem(item),
    addBreakingNews: (news) => window.newsTicker?.addBreakingNews(news),
    clear: () => window.newsTicker?.clear(),
    pause: () => window.newsTicker?.pause(),
    resume: () => window.newsTicker?.resume()
};