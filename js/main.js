// Main JavaScript for Homepage
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Helper function to fetch data from API
async function fetchFromAPI(endpoint, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/tmdb?endpoint=${endpoint}${queryString ? '&' + queryString : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`Failed to fetch from ${endpoint}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Display media items in gallery
function displayMedia(mediaItems, container, mediaType) {
    container.innerHTML = '';
    
    if (!mediaItems || mediaItems.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No items found</p>';
        return;
    }

    mediaItems.forEach(item => {
        if (!item.poster_path) return;

        const type = mediaType || item.media_type;
        const title = item.title || item.name;
        const year = item.release_date || item.first_air_date;
        const rating = item.vote_average;

        const posterDiv = document.createElement('div');
        posterDiv.classList.add('poster');
        
        posterDiv.innerHTML = `
            <img src="${imageBaseUrl}${item.poster_path}" 
                 alt="${title}"
                 loading="lazy">
            <div class="poster-info">
                <div class="poster-title">${title}</div>
                <div class="poster-meta">
                    ${rating ? `
                        <span class="rating">
                            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ${rating.toFixed(1)}
                        </span>
                    ` : ''}
                    ${year ? `<span>${year.split('-')[0]}</span>` : ''}
                </div>
            </div>
        `;
        
        posterDiv.addEventListener('click', () => {
            localStorage.setItem('selectedId', item.id);
            localStorage.setItem('selectedType', type);
            window.location.href = 'player.html';
        });

        container.appendChild(posterDiv);
    });
}

// Load homepage content
async function loadHomepage() {
    // Load trending
    const trendingData = await fetchFromAPI('trending/all/week');
    if (trendingData) {
        displayMedia(trendingData.results.slice(0, 10), 
                    document.getElementById('trending-gallery'));
    }

    // Load popular movies
    const moviesData = await fetchFromAPI('movie/popular');
    if (moviesData) {
        displayMedia(moviesData.results.slice(0, 10), 
                    document.getElementById('movie-gallery'), 'movie');
    }

    // Load popular TV shows
    const tvData = await fetchFromAPI('tv/popular');
    if (tvData) {
        displayMedia(tvData.results.slice(0, 10), 
                    document.getElementById('tv-gallery'), 'tv');
    }

    // Load top rated movies
    const topRatedData = await fetchFromAPI('movie/top_rated');
    if (topRatedData) {
        displayMedia(topRatedData.results.slice(0, 10), 
                    document.getElementById('toprated-gallery'), 'movie');
    }
}

// Setup search functionality
function setupSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHomepage();
    setupSearch();
});