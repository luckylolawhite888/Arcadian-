// Arcadian Media - Cyberpunk Dashboard JavaScript

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Arcadian Media Dashboard Initializing...');
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up periodic refresh (every 5 minutes)
    setInterval(loadDashboardData, 5 * 60 * 1000);
    
    // Initialize news ticker
    initNewsTicker();
});

// Update date and time display
function updateDateTime() {
    const now = new Date();
    
    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-GB', options);
    document.getElementById('currentDate').textContent = dateStr;
    
    // Format time
    const timeStr = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });
    document.getElementById('currentTime').textContent = timeStr;
    
    // Update last update time
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
        lastUpdate.textContent = now.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }
}

// Load all dashboard data
function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Show loading states
    showLoadingStates();
    
    // Fetch data from backend
    fetch('/api/dashboard-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dashboard data loaded:', data);
            updateDashboard(data);
            
            // Check for breaking news
            if (data.breaking_news) {
                showBreakingNews(data.breaking_news);
            }
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            showErrorStates();
        });
}

// Show loading states
function showLoadingStates() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        if (!el.textContent.includes('Error')) {
            el.textContent = 'Loading...';
        }
    });
}

// Show error states
function showErrorStates() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.textContent = 'Error loading data';
        el.style.color = '#ff0000';
    });
}

// Update dashboard with data
function updateDashboard(data) {
    // Update to-do list
    if (data.todo_list && Array.isArray(data.todo_list)) {
        updateTodoList(data.todo_list);
    }
    
    // Update shopping list
    if (data.shopping_list && Array.isArray(data.shopping_list)) {
        updateShoppingList(data.shopping_list);
    }
    
    // Update weather
    if (data.weather) {
        updateWeather(data.weather);
    }
    
    // Update travel deals
    if (data.travel_deals) {
        updateTravelDeals(data.travel_deals);
    }
    
    // Update air quality
    if (data.air_quality) {
        updateAirQuality(data.air_quality);
    }
    
    // Update news
    if (data.news) {
        updateNews(data.news);
    }
    
    // Update sports news
    if (data.sports_news) {
        updateSportsNews(data.sports_news);
    }
    
    // Update horoscope
    if (data.horoscope) {
        updateHoroscope(data.horoscope);
    }
    
    // Update numerology
    if (data.numerology) {
        updateNumerology(data.numerology);
    }
    
    // Update quote
    if (data.quote) {
        updateQuote(data.quote);
    }
}

// Update to-do list
function updateTodoList(todos) {
    const todoList = document.getElementById('todoList');
    const todoCount = document.getElementById('todoCount');
    
    if (!todoList) return;
    
    todoList.innerHTML = '';
    let activeCount = 0;
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'fade-in';
        
        // Check if it's completed
        if (todo.text.startsWith('[x]') || todo.text.startsWith('[X]')) {
            li.innerHTML = `<s>${todo.text.replace(/^\[x\]\s*/i, '')}</s>`;
            li.style.color = '#666';
        } else {
            li.textContent = todo.text.replace(/^\[\s*\]\s*/, '');
            activeCount++;
        }
        
        todoList.appendChild(li);
    });
    
    if (todoCount) {
        todoCount.textContent = activeCount;
    }
    
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="loading">No tasks for today</li>';
    }
}

// Update shopping list
function updateShoppingList(items) {
    const shoppingList = document.getElementById('shoppingList');
    const shoppingCount = document.getElementById('shoppingCount');
    
    if (!shoppingList) return;
    
    shoppingList.innerHTML = '';
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'fade-in';
        li.textContent = item;
        shoppingList.appendChild(li);
    });
    
    if (shoppingCount) {
        shoppingCount.textContent = items.length;
    }
    
    if (items.length === 0) {
        shoppingList.innerHTML = '<li class="loading">Shopping list is empty</li>';
    }
}

// Update weather display
function updateWeather(weather) {
    const weatherDisplay = document.getElementById('weather');
    if (!weatherDisplay) return;
    
    let html = '';
    
    if (weather.error) {
        html = `<div class="loading">${weather.error}</div>`;
    } else {
        html = `
            <div class="weather-item">
                <span>Temperature:</span>
                <span class="orange-text">${weather.temperature}°C</span>
            </div>
            <div class="weather-item">
                <span>Conditions:</span>
                <span>${weather.conditions}</span>
            </div>
            <div class="weather-item">
                <span>Outfit Advice:</span>
                <span>${weather.outfit_advice}</span>
            </div>
            <div class="weather-item">
                <span>Humidity:</span>
                <span>${weather.humidity}%</span>
            </div>
            <div class="weather-item">
                <span>Wind:</span>
                <span>${weather.wind_speed} km/h</span>
            </div>
        `;
    }
    
    weatherDisplay.innerHTML = html;
}

// Update travel deals
function updateTravelDeals(deals) {
    const travelDisplay = document.getElementById('travel');
    if (!travelDisplay) return;
    
    let html = '';
    
    if (deals.error) {
        html = `<div class="loading">${deals.error}</div>`;
    } else if (Array.isArray(deals) && deals.length > 0) {
        deals.forEach(deal => {
            html += `
                <div class="travel-deal fade-in">
                    <div><strong>${deal.destination}</strong></div>
                    <div class="deal-price">${deal.price}</div>
                    <div>${deal.description}</div>
                    <div><small>${deal.tip}</small></div>
                </div>
            `;
        });
    } else {
        html = '<div class="loading">No travel deals found today</div>';
    }
    
    travelDisplay.innerHTML = html;
}

// Update air quality
function updateAirQuality(airQuality) {
    const airDisplay = document.getElementById('airquality');
    if (!airDisplay) return;
    
    let html = '';
    
    if (airQuality.error) {
        html = `<div class="loading">${airQuality.error}</div>`;
    } else {
        // Determine color based on AQI
        let aqiColor = '#00ff00'; // Good
        if (airQuality.aqi_level >= 4) aqiColor = '#ff0000'; // Poor
        else if (airQuality.aqi_level >= 3) aqiColor = '#ff9900'; // Moderate
        
        html = `
            <div class="weather-item">
                <span>AQI Level:</span>
                <span style="color: ${aqiColor}; font-weight: bold;">${airQuality.aqi_level}/5</span>
            </div>
            <div class="weather-item">
                <span>Status:</span>
                <span>${airQuality.status}</span>
            </div>
            <div class="weather-item">
                <span>Main Pollutant:</span>
                <span>${airQuality.main_pollutant}</span>
            </div>
            <div class="weather-item">
                <span>Health Advice:</span>
                <span>${airQuality.health_advice}</span>
            </div>
        `;
    }
    
    airDisplay.innerHTML = html;
}

// Update news
function updateNews(news) {
    const newsDisplay = document.getElementById('news');
    if (!newsDisplay) return;
    
    let html = '';
    
    if (news.error) {
        html = `<div class="loading">${news.error}</div>`;
    } else if (Array.isArray(news) && news.length > 0) {
        news.forEach(item => {
            html += `
                <div class="news-item fade-in">
                    <div class="news-title">${item.title}</div>
                    <div>${item.summary}</div>
                    <div><small>Source: ${item.source}</small></div>
                </div>
            `;
        });
    } else {
        html = '<div class="loading">No news available</div>';
    }
    
    newsDisplay.innerHTML = html;
}

// Update sports news
function updateSportsNews(sports) {
    const sportsDisplay = document.getElementById('sports');
    if (!sportsDisplay) return;
    
    let html = '';
    
    if (sports.error) {
        html = `<div class="loading">${sports.error}</div>`;
    } else if (Array.isArray(sports) && sports.length > 0) {
        sports.forEach(item => {
            html += `
                <div class="news-item fade-in">
                    <div class="news-title">${item.sport}: ${item.title}</div>
                    <div>${item.summary}</div>
                    <div><small>${item.time}</small></div>
                </div>
            `;
        });
    } else {
        html = '<div class="loading">No sports news available</div>';
    }
    
    sportsDisplay.innerHTML = html;
}

// Update horoscope
function updateHoroscope(horoscope) {
    const horoscopeDisplay = document.getElementById('horoscope');
    if (!horoscopeDisplay) return;
    
    let html = '';
    
    if (horoscope.error) {
        html = `<div class="loading">${horoscope.error}</div>`;
    } else {
        html = `
            <div class="weather-item">
                <span>Sign:</span>
                <span class="orange-text">${horoscope.sign}</span>
            </div>
            <div class="weather-item">
                <span>Date Range:</span>
                <span>${horoscope.date_range}</span>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: rgba(255, 102, 0, 0.1); border-radius: 5px;">
                <strong>Today's Reading:</strong><br>
                ${horoscope.prediction}
            </div>
            <div style="margin-top: 10px;">
                <small>Lucky Number: <span class="orange-text">${horoscope.lucky_number}</span></small><br>
                <small>Mood: ${horoscope.mood}</small>
            </div>
        `;
    }
    
    horoscopeDisplay.innerHTML = html;
}

// Update numerology
function updateNumerology(numerology) {
    const numerologyDisplay = document.getElementById('numerology');
    if (!numerologyDisplay) return;
    
    let html = '';
    
    if (numerology.error) {
        html = `<div class="loading">${numerology.error}</div>`;
    } else {
        html = `
            <div class="weather-item">
                <span>Today's Number:</span>
                <span class="orange-text" style="font-size: 1.5rem;">${numerology.number}</span>
            </div>
            <div class="weather-item">
                <span>Meaning:</span>
                <span>${numerology.meaning}</span>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: rgba(255, 102, 0, 0.1); border-radius: 5px;">
                <strong>Advice for Today:</strong><br>
                ${numerology.advice}
            </div>
        `;
    }
    
    numerologyDisplay.innerHTML = html;
}

// Update quote
function updateQuote(quote) {
    const quoteDisplay = document.getElementById('quote');
    if (!quoteDisplay) return;
    
    let html = '';
    
    if (quote.error) {
        html = `<div class="loading">${quote.error}</div>`;
    } else {
        html = `
            <div style="font-style: italic; font-size: 1.1rem; margin-bottom: 10px;">
                "${quote.text}"
            </div>
            <div style="text-align: right; color: var(--neon-orange);">
                — ${quote.author}
            </div>
        `;
    }
    
    quoteDisplay.innerHTML = html;
}

// Show breaking news
function showBreakingNews(news) {
    const breakingNews = document.getElementById('breakingNews');
    if (!breakingNews) return;
    
    const breakingText = breakingNews.querySelector('.breaking-text');
    if (breakingText) {
        breakingText.textContent = `BREAKING NEWS: ${news}`;
    }
    
    breakingNews.style.display = 'block';
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
        breakingNews.style.display = 'none';
    }, 30000);
}

// Initialize news ticker
function initNewsTicker() {
    // This will be populated by ticker.js
    console.log('News ticker initialized');
}

// Manual refresh function
function refreshData() {
    console.log('Manual refresh triggered');
    
    // Add visual feedback
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> REFRESHING...';
        refreshBtn.disabled = true;
    }
    
    loadDashboardData();
    
    // Re-enable button after 3 seconds
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> MANUAL REFRESH';
            refreshBtn.disabled = false;
        }
    }, 3000);
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Export for use in other files
window.ArcadianMedia = {
    refreshData,
    toggleFullscreen,
    loadDashboardData
};