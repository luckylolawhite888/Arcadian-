// UNSLASH API INTEGRATION FOR TNWO LUXURY BRAND
// "Eyes Wide Shut" meets "Wall Street" aesthetic

const UNSPLASH_ACCESS_KEY = 'nIYmJCSP_PaeNOOM8tKVS_04D6uuXcB58o1XKcqk_As';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Curated search queries for luxury intelligence aesthetic
const IMAGE_CATEGORIES = {
    'lead-story': ['journalistic photography', 'global politics', 'power meeting', 'boardroom', 'diplomacy'],
    'economics': ['wall street', 'trading floor', 'financial district', 'money', 'banking'],
    'technology': ['quantum computing', 'ai laboratory', 'server room', 'cybersecurity', 'futuristic tech'],
    'politics': ['government building', 'capitol', 'diplomatic meeting', 'political rally', 'power structure'],
    'horoscope': ['celestial', 'stars', 'planets', 'cosmic', 'astrology', 'zodiac'],
    'vault': ['secure facility', 'vault door', 'classified', 'encryption', 'elite access'],
    'members': ['luxury lounge', 'executive club', 'premium access', 'elite membership', 'private']
};

// Cache to avoid duplicate API calls
let imageCache = {};

/**
 * Fetch high-res, moody journalistic image from Unsplash
 * @param {string} category - Image category from IMAGE_CATEGORIES
 * @param {string} elementId - HTML element ID to set background image
 * @param {object} options - Additional options (size, orientation, etc.)
 */
async function fetchLuxuryImage(category, elementId, options = {}) {
    const cacheKey = `${category}-${elementId}`;
    
    // Check cache first
    if (imageCache[cacheKey]) {
        applyImageToElement(elementId, imageCache[cacheKey]);
        return imageCache[cacheKey];
    }
    
    try {
        // Select random query from category
        const queries = IMAGE_CATEGORIES[category] || ['journalistic photography'];
        const query = queries[Math.floor(Math.random() * queries.length)];
        
        // Build API request
        const params = new URLSearchParams({
            query: query,
            orientation: options.orientation || 'landscape',
            content_filter: 'high',
            per_page: 1,
            client_id: UNSPLASH_ACCESS_KEY
        });
        
        // Add optional parameters
        if (options.color) params.append('color', options.color);
        if (options.size) params.append('w', options.size);
        
        const response = await fetch(`${UNSPLASH_API_URL}/photos/random?${params}`);
        
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Get appropriate image size
        let imageUrl;
        if (options.size === 'small') {
            imageUrl = data.urls.small;
        } else if (options.size === 'thumb') {
            imageUrl = data.urls.thumb;
        } else {
            imageUrl = data.urls.regular; // High-res default
        }
        
        // Cache the result
        imageCache[cacheKey] = {
            url: imageUrl,
            alt: data.alt_description || `Luxury ${category} imagery`,
            photographer: data.user.name,
            photographerUrl: data.user.links.html
        };
        
        // Apply to element
        applyImageToElement(elementId, imageCache[cacheKey]);
        
        return imageCache[cacheKey];
        
    } catch (error) {
        console.error(`Failed to fetch ${category} image:`, error);
        
        // Fallback to gradient
        const fallbackGradient = getCategoryGradient(category);
        applyGradientToElement(elementId, fallbackGradient);
        
        return null;
    }
}

/**
 * Apply Unsplash image to HTML element with luxury styling
 */
function applyImageToElement(elementId, imageData) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Create image container with luxury effects
    element.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${imageData.url}')`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';
    
    // Add glassmorphism overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(255, 255, 255, 0.05)';
    overlay.style.backdropFilter = 'blur(10px)';
    overlay.style.zIndex = '1';
    
    // Add credit (subtle, luxury style)
    const credit = document.createElement('div');
    credit.style.position = 'absolute';
    credit.style.bottom = '10px';
    credit.style.right = '10px';
    credit.style.fontSize = '10px';
    credit.style.color = 'rgba(255, 255, 255, 0.5)';
    credit.style.fontFamily = 'Inter, sans-serif';
    credit.style.zIndex = '2';
    credit.innerHTML = `📷 ${imageData.photographer}`;
    
    element.style.position = 'relative';
    element.appendChild(overlay);
    element.appendChild(credit);
}

/**
 * Fallback gradient for each category
 */
function getCategoryGradient(category) {
    const gradients = {
        'lead-story': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'economics': 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
        'technology': 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
        'politics': 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        'horoscope': 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
        'vault': 'linear-gradient(135deg, #000000 0%, #1a1a2e 100%)',
        'members': 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)'
    };
    
    return gradients[category] || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
}

function applyGradientToElement(elementId, gradient) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.background = gradient;
    }
}

/**
 * Initialize all images on page load
 */
function initializeLuxuryImagery() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🖼️ Initializing TNWO Luxury Imagery');
        
        // Homepage images
        setTimeout(() => {
            fetchLuxuryImage('lead-story', 'lead-story-image', { size: 'regular' });
            fetchLuxuryImage('economics', 'economics-image', { size: 'small' });
            fetchLuxuryImage('politics', 'politics-image', { size: 'small' });
            fetchLuxuryImage('technology', 'tech-image', { size: 'small' });
        }, 500);
        
        // Horoscope celestial imagery
        setTimeout(() => {
            fetchLuxuryImage('horoscope', 'celestial-header-image', { orientation: 'landscape' });
            for (let i = 0; i < 12; i++) {
                fetchLuxuryImage('horoscope', `zodiac-image-${i}`, { size: 'thumb' });
            }
        }, 1000);
        
        // Members lounge imagery
        setTimeout(() => {
            fetchLuxuryImage('members', 'members-hero-image', { size: 'regular' });
            fetchLuxuryImage('members', 'benefit-image-1', { size: 'small' });
            fetchLuxuryImage('members', 'benefit-image-2', { size: 'small' });
            fetchLuxuryImage('members', 'benefit-image-3', { size: 'small' });
        }, 1500);
        
        // Vault imagery
        setTimeout(() => {
            fetchLuxuryImage('vault', 'vault-door-image', { orientation: 'portrait' });
            fetchLuxuryImage('vault', 'classified-preview-1', { size: 'thumb' });
            fetchLuxuryImage('vault', 'classified-preview-2', { size: 'thumb' });
        }, 2000);
    });
}

/**
 * Preload images for smoother experience
 */
function preloadCategoryImages(category) {
    const queries = IMAGE_CATEGORIES[category];
    if (!queries) return;
    
    queries.forEach(query => {
        const img = new Image();
        img.src = `https://source.unsplash.com/featured/?${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;
    });
}

// Export for use in HTML
window.TNWOImagery = {
    fetchLuxuryImage,
    initializeLuxuryImagery,
    preloadCategoryImages
};

// Auto-initialize if script is loaded
if (typeof window !== 'undefined') {
    initializeLuxuryImagery();
}