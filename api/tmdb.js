// Save as: api/tmdb.js

// This function is the "handler" for all requests to /api/tmdb
export default async function handler(request, response) {
    
    // Get the API key from Vercel's Environment Variables
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: 'API key is not configured.' });
    }

    // Get the TMDB endpoint and query from our frontend's request
    // e.g., /api/tmdb?endpoint=movie/popular&query=batman&page=1
    const { endpoint, ...queryParams } = request.query;

    if (!endpoint) {
        return response.status(400).json({ error: 'No endpoint provided.' });
    }

    // Build the query string for the TMDB API
    const queryString = new URLSearchParams({
        api_key: apiKey,
        ...queryParams
    }).toString();

    const tmdbUrl = `https://api.themoviedb.org/3/${endpoint}?${queryString}`;

    try {
        // Call the real TMDB API
        const tmdbResponse = await fetch(tmdbUrl);
        
        if (!tmdbResponse.ok) {
            // Forward the error from TMDB
            const errorData = await tmdbResponse.json();
            return response.status(tmdbResponse.status).json(errorData);
        }

        // Send the successful data back to our frontend
        const data = await tmdbResponse.json();
        return response.status(200).json(data);

    } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch data' });
    }
}