// Enhanced Search JavaScript
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

async function fetchFromAPI(endpoint, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/api/tmdb?endpoint=${endpoint}${queryString ? '&' + queryString : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

function displayMedia(mediaItems, container) {
    container.innerHTML = '';
    
    if (!mediaItems || mediaItems.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <h3 style="font-size: 2rem; margin-bottom: 10px;">😕 No results found</h3>
                <p style="color: #666;">Try searching with different keywords</p>
            </div>
        `;
        return;
    }

    mediaItems.forEach(item => {
        // Filter to only movies and TV shows
        if ((item.media_type !== 'movie' && item.media_type !== 'tv') || !item.poster_path) {
            return;
        }

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
                    <span>${item.media_type === 'movie' ? '🎬' : '📺'}</span>
                </div>
            </div>
        `;
        
        posterDiv.addEventListener('click', () => {
            localStorage.setItem('selectedId', item.id);
            localStorage.setItem('selectedType', item.media_type);
            window.location.href = 'player.html';
        });

        container.appendChild(posterDiv);
    });
}

async function handleSearch() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const resultsGallery = document.getElementById('results-gallery');
    const searchTitle = document.getElementById('search-title');
    const searchInput = document.getElementById('search-input');

    if (!query) {
        searchTitle.innerText = "Please enter a search term";
        resultsGallery.innerHTML = '';
        return;
    }

    searchTitle.innerText = `Search results for "${query}"`;
    if (searchInput) searchInput.value = query;

    // Show loading skeleton
    resultsGallery.innerHTML = `
        ${'<div class="skeleton-loader"></div>'.repeat(10)}
    `;

    const data = await fetchFromAPI('search/multi', { query });
    
    if (data) {
        displayMedia(data.results, resultsGallery);
    } else {
        resultsGallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Failed to load results</p>';
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    handleSearch();
    setupSearch();
});