// Enhanced Player JavaScript
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const playerContainer = document.getElementById('player-container');
const tvControls = document.getElementById('tv-controls');
const seasonSelect = document.getElementById('season-select');
const episodeList = document.getElementById('episode-list');
const detailsContainer = document.getElementById('media-details');

const mediaId = localStorage.getItem('selectedId');
const mediaType = localStorage.getItem('selectedType');

// Fetch helper
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`/api/tmdb?endpoint=${endpoint}`);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Load player iframe
function loadPlayer(type, id, season = null, episode = null) {
    playerContainer.innerHTML = '';
    let newPlayerUrl; // Use a new variable name

    if (type === 'movie') {
        // --- THIS IS THE OLD LINE ---
        // vidkingUrl = `https://www.vidking.net/embed/movie/${id}`;
        
        // --- THIS IS THE NEW LINE ---
        newPlayerUrl = `https://vidsrc.me/embed/movie?tmdb=${id}`;

    } else {
        // --- THIS IS THE OLD LINE ---
        // vidkingUrl = `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
        
        // --- THIS IS THE NEW LINE ---
        newPlayerUrl = `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    }

    const iframe = document.createElement('iframe');
    
    // Make sure to use your new URL variable here
    iframe.src = newPlayerUrl; 
    
    iframe.allowFullscreen = true;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    playerContainer.appendChild(iframe);
}

// Display media details
function displayDetails(data, type) {
    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date;
    const runtime = type === 'movie' ? data.runtime : data.episode_run_time?.[0];
    const rating = data.vote_average;

    let detailsHTML = `
        <h1 class="media-title">${title}</h1>
        <div class="media-meta">
            ${releaseDate ? `<span>📅 ${releaseDate.split('-')[0]}</span>` : ''}
            ${runtime ? `<span>⏱️ ${runtime} min</span>` : ''}
            ${rating ? `<span>⭐ ${rating.toFixed(1)}/10</span>` : ''}
            ${data.genres ? `<span>🎬 ${data.genres.map(g => g.name).join(', ')}</span>` : ''}
        </div>
        ${data.overview ? `<p class="media-overview">${data.overview}</p>` : ''}
    `;

    if (detailsContainer) {
        detailsContainer.innerHTML = detailsHTML;
    }
}

// Load episodes for TV shows
async function loadEpisodes(tvId, seasonNum) {
    const seasonData = await fetchFromAPI(`tv/${tvId}/season/${seasonNum}`);
    if (!seasonData) return;

    episodeList.innerHTML = '';

    seasonData.episodes.forEach(episode => {
        const epDiv = document.createElement('div');
        epDiv.classList.add('episode');
        epDiv.innerHTML = `
            <div>E${episode.episode_number}</div>
            <div style="font-size: 0.9em; opacity: 0.8;">${episode.name}</div>
        `;
        
        epDiv.addEventListener('click', () => {
            document.querySelectorAll('.episode.active').forEach(el => 
                el.classList.remove('active')
            );
            epDiv.classList.add('active');
            loadPlayer('tv', tvId, seasonNum, episode.episode_number);
        });

        episodeList.appendChild(epDiv);
    });

    // Auto-select first episode
    if (episodeList.firstChild) {
        episodeList.firstChild.click();
    }
}

// Initialize player
async function initializePlayer() {
    if (!mediaId || !mediaType) {
        playerContainer.innerHTML = '<div style="padding: 50px; text-align: center;"><h2>❌ No media selected</h2><p>Please select a movie or TV show from the homepage.</p></div>';
        return;
    }

    if (mediaType === 'movie') {
        // Hide TV controls
        if (tvControls) tvControls.style.display = 'none';
        
        // Load movie details
        const movieData = await fetchFromAPI(`movie/${mediaId}`);
        if (movieData) {
            displayDetails(movieData, 'movie');
        }
        
        // Load player
        loadPlayer('movie', mediaId);

    } else if (mediaType === 'tv') {
        // Show TV controls
        if (tvControls) tvControls.style.display = 'block';
        
        // Load TV details
        const tvData = await fetchFromAPI(`tv/${mediaId}`);
        if (!tvData) return;

        displayDetails(tvData, 'tv');

        // Populate seasons
        seasonSelect.innerHTML = '';
        tvData.seasons.forEach(season => {
            if (season.season_number > 0) {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.text = season.name;
                seasonSelect.appendChild(option);
            }
        });

        // Load first season episodes
        await loadEpisodes(mediaId, seasonSelect.value);

        // Season change listener
        seasonSelect.addEventListener('change', () => {
            loadEpisodes(mediaId, seasonSelect.value);
        });
    }
}

// Run player
document.addEventListener('DOMContentLoaded', initializePlayer);