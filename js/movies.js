// Movies Browse Page JavaScript
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

function displayMovies(movies, container, append = false) {
    if (!append) {
        container.innerHTML = '';
    }
    
    if (!movies || movies.length === 0) {
        if (!append) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No movies found</p>';
        }
        return;
    }

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const posterDiv = document.createElement('div');
        posterDiv.classList.add('poster');
        posterDiv.innerHTML = `
            <img src="${imageBaseUrl}${movie.poster_path}" 
                 alt="${movie.title}"
                 loading="lazy">
            <div class="poster-info">
                <div class="poster-title">${movie.title}</div>
                <div class="poster-meta">
                    ${movie.vote_average ? `
                        <span class="rating">
                            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ${movie.vote_average.toFixed(1)}
                        </span>
                    ` : ''}
                    ${movie.release_date ? `<span>${movie.release_date.split('-')[0]}</span>` : ''}
                </div>
            </div>
        `;
        
        posterDiv.addEventListener('click', () => {
            localStorage.setItem('selectedId', movie.id);
            localStorage.setItem('selectedType', 'movie');
            window.location.href = 'player.html';
        });

        container.appendChild(posterDiv);
    });
}

async function loadMovies(filter = 'popular', page = 1, append = false) {
    if (isLoading) return;
    
    isLoading = true;
    const gallery = document.getElementById('movies-gallery');
    const loadMoreBtn = document.getElementById('load-more');
    
    if (!append) {
        gallery.innerHTML = `${'<div class="skeleton-loader"></div>'.repeat(8)}`;
    }
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    const data = await fetchFromAPI(`movie/${filter}`, { page });
    
    if (data) {
        displayMovies(data.results, gallery, append);
        
        // Enable/disable load more based on available pages
        if (page < data.total_pages) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More';
        } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'No More Movies';
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
            loadMovies(currentFilter, currentPage);
        });
    });
}

function setupLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadMovies(currentFilter, currentPage, true);
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
    loadMovies();
    setupFilters();
    setupLoadMore();
    setupSearch();
});