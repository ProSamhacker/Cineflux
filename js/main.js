// Save as: js/main.js

const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Helper function to fetch data from our secure API
async function fetchFromAPI(endpoint) {
    const response = await fetch(`/api/tmdb?endpoint=${endpoint}`);
    if (!response.ok) {
        console.error("Failed to fetch data");
        return null;
    }
    return response.json();
}

// Reusable function to display media
function displayMedia(mediaItems, container, mediaType) {
    container.innerHTML = ''; // Clear existing
    mediaItems.forEach(item => {
        if (!item.poster_path) return; // Skip items without a poster

        const posterDiv = document.createElement('div');
        posterDiv.classList.add('poster');
        posterDiv.innerHTML = `<img src="${imageBaseUrl}${item.poster_path}" alt="${item.title || item.name}">`;
        
        // Add click listener to go to player page
        posterDiv.addEventListener('click', () => {
            // Save the ID and type to local storage
            localStorage.setItem('selectedId', item.id);
            localStorage.setItem('selectedType', mediaType);
            window.location.href = 'player.html';
        });

        container.appendChild(posterDiv);
    });
}

// Load popular movies and TV shows
async function loadHomepage() {
    const moviesData = await fetchFromAPI('movie/popular');
    if (moviesData) {
        displayMedia(moviesData.results, document.getElementById('movie-gallery'), 'movie');
    }

    const tvData = await fetchFromAPI('tv/popular');
    if (tvData) {
        displayMedia(tvData.results, document.getElementById('tv-gallery'), 'tv');
    }
}

// Search bar logic
function setupSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // Redirect to the search results page with the query
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
}

// Run everything
loadHomepage();
setupSearch();