// TV Shows Browse Page JavaScript
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
let currentFilter = 'popular';
let currentPage = 1;
let isLoading = false;

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

function displayTVShows(shows, container, append = false) {
    if (!append) {
        container.innerHTML = '';
    }
    
    if (!shows || shows.length === 0) {
        if (!append) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No TV shows found</p>';
        }
        return;
    }

    shows.forEach(show => {
        if (!show.poster_path) return;

        const posterDiv = document.createElement('div');
        posterDiv.classList.add('poster');
        posterDiv.innerHTML = `
            <img src="${imageBaseUrl}${show.poster_path}" 
                 alt="${show.name}"
                 loading="lazy">
            <div class="poster-info">
                <div class="poster-title">${show.name}</div>
                <div class="poster-meta">
                    ${show.vote_average ? `
                        <span class="rating">
                            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ${show.vote_average.toFixed(1)}
                        </span>
                    ` : ''}
                    ${show.first_air_date ? `<span>${show.first_air_date.split('-')[0]}</span>` : ''}
                </div>
            </div>
        `;
        
        posterDiv.addEventListener('click', () => {
            localStorage.setItem('selectedId', show.id);
            localStorage.setItem('selectedType', 'tv');
            window.location.href = 'player.html';
        });

        container.appendChild(posterDiv);
    });
}

async function loadTVShows(filter = 'popular', page = 1, append = false) {
    if (isLoading) return;
    
    isLoading = true;
    const gallery = document.getElementById('tvshows-gallery');
    const loadMoreBtn = document.getElementById('load-more');
    
    if (!append) {
        gallery.innerHTML = `${'<div class="skeleton-loader"></div>'.repeat(8)}`;
    }
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    const data = await fetchFromAPI(`tv/${filter}`, { page });
    
    if (data) {
        displayTVShows(data.results, gallery, append);
        
        // Enable/disable load more based on available pages
        if (page < data.total_pages) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
        } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'No More Shows';
        }
    }
    
    isLoading = false;
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Load new filter
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            loadTVShows(currentFilter, currentPage);
        });
    });
}

function setupLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadTVShows(currentFilter, currentPage, true);
    });
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
    loadTVShows();
    setupFilters();
    setupLoadMore();
    setupSearch();
});