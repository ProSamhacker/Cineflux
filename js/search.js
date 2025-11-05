// Save as: js/search.js

const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Helper function to display media
function displayMedia(mediaItems, container) {
    container.innerHTML = ''; // Clear existing
    mediaItems.forEach(item => {
        // Filter out "person" results, only show movies and TV
        if ((item.media_type !== 'movie' && item.media_type !== 'tv') || !item.poster_path) {
            return;
        }

        const posterDiv = document.createElement('div');
        posterDiv.classList.add('poster');
        posterDiv.innerHTML = `<img src="${imageBaseUrl}${item.poster_path}" alt="${item.title || item.name}">`;
        
        posterDiv.addEventListener('click', () => {
            localStorage.setItem('selectedId', item.id);
            localStorage.setItem('selectedType', item.media_type);
            window.location.href = 'player.html';
        });

        container.appendChild(posterDiv);
    });
}

// Handle the search query from the URL
async function handleSearch() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (!query) {
        document.getElementById('search-title').innerText = "Please enter a search term.";
        return;
    }

    document.getElementById('search-title').innerText = `Results for "${query}"`;
    document.getElementById('search-input').value = query; // Fill the search bar

    // Call our API's search endpoint
    const response = await fetch(`/api/tmdb?endpoint=search/multi&query=${encodeURIComponent(query)}`);
    if (response.ok) {
        const data = await response.json();
        displayMedia(data.results, document.getElementById('results-gallery'));
    }
}

// Setup search bar on this page too
function setupSearch() {
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
}

handleSearch();
setupSearch();