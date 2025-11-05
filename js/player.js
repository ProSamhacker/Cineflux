// Save as: js/player.js

const playerContainer = document.getElementById('player-container');
const tvControls = document.getElementById('tv-controls');
const seasonSelect = document.getElementById('season-select');
const episodeList = document.getElementById('episode-list');

// Get the ID and Type from local storage
const mediaId = localStorage.getItem('selectedId');
const mediaType = localStorage.getItem('selectedType');

// --- Helper Functions ---

// Creates and loads the Vidking iframe
function loadPlayer(type, id, season = null, episode = null) {
    playerContainer.innerHTML = ''; // Clear old player
    let vidkingUrl;

    if (type === 'movie') {
        vidkingUrl = `https://www.vidking.net/embed/movie/${id}`;
    } else {
        vidkingUrl = `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
    }

    const iframe = document.createElement('iframe');
    iframe.src = vidkingUrl;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    playerContainer.appendChild(iframe);
}

// Fetches TV show details (like season list)
async function fetchTVDetails(id) {
    const response = await fetch(`/api/tmdb?endpoint=tv/${id}`);
    return response.json();
}

// Fetches details for a specific season (episode list)
async function fetchSeasonDetails(id, seasonNum) {
    const response = await fetch(`/api/tmdb?endpoint=tv/${id}/season/${seasonNum}`);
    return response.json();
}

// --- Main Logic ---

async function initializePlayer() {
    if (!mediaId || !mediaType) {
        playerContainer.innerHTML = "<h2>Error: No media selected.</h2>";
        return;
    }

    if (mediaType === 'movie') {
        tvControls.style.display = 'none'; // Hide TV controls
        loadPlayer('movie', mediaId);

    } else if (mediaType === 'tv') {
        tvControls.style.display = 'flex'; // Show TV controls
        
        // 1. Fetch TV details to get season list
        const tvData = await fetchTVDetails(mediaId);
        seasonSelect.innerHTML = ''; // Clear options
        tvData.seasons.forEach(season => {
            // Don't show "Specials" (season 0)
            if (season.season_number > 0) {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.text = season.name;
                seasonSelect.appendChild(option);
            }
        });

        // 2. Load episodes for the first season by default
        await loadEpisodes(mediaId, seasonSelect.value);

        // 3. Add event listener to change episodes when season changes
        seasonSelect.addEventListener('change', () => {
            loadEpisodes(mediaId, seasonSelect.value);
        });
    }
}

// Loads and renders the episode list for a season
async function loadEpisodes(tvId, seasonNum) {
    const seasonData = await fetchSeasonDetails(tvId, seasonNum);
    episodeList.innerHTML = ''; // Clear old episodes

    seasonData.episodes.forEach(episode => {
        const epDiv = document.createElement('div');
        epDiv.classList.add('episode');
        epDiv.innerText = `E${episode.episode_number}: ${episode.name}`;
        
        // Add click listener to load this episode
        epDiv.addEventListener('click', () => {
            // Highlight the active episode
            document.querySelectorAll('.episode.active').forEach(el => el.classList.remove('active'));
            epDiv.classList.add('active');

            // Load the player
            loadPlayer('tv', tvId, seasonNum, episode.episode_number);
        });
        episodeList.appendChild(epDiv);
    });

    // Automatically load and highlight the first episode
    if (episodeList.firstChild) {
        episodeList.firstChild.click();
    }
}

// Run the player
initializePlayer();