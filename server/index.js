import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize cache (24 hour TTL)
const cache = new NodeCache({ stdTTL: 86400 });

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['chrome-extension://*'] 
    : ['http://localhost:*', 'chrome-extension://*'],
  credentials: true
}));
app.use(express.json());

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Movie endpoint
app.get('/api/movie/:imdbId', async (req, res) => {
  const { imdbId } = req.params;
  const cacheKey = `movie_${imdbId}`;
  
  try {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Fetch from TMDB API
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB API key not configured');
    }

    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&language=en-US&external_source=imdb_id`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.movie_results && data.movie_results.length > 0) {
      const movieData = {
        imdbId,
        releaseDate: data.movie_results[0].release_date,
        title: data.movie_results[0].title
      };
      
      // Cache the result
      cache.set(cacheKey, movieData);
      
      res.json({
        success: true,
        data: movieData
      });
    } else {
      res.json({
        success: false,
        error: 'Movie not found'
      });
    }
  } catch (error) {
    console.error('Error fetching movie data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Actor endpoint
app.get('/api/actor/:actorName', async (req, res) => {
  const { actorName } = req.params;
  const cacheKey = `actor_${actorName.toLowerCase()}`;
  
  try {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Fetch from TMDB API
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB API key not configured');
    }

    // Search for actor
    const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(actorName)}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`TMDB API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      const actorId = searchData.results[0].id;
      
      // Get actor details
      const detailsUrl = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      const actorData = {
        name: actorName,
        dateOfBirth: detailsData.birthday,
        id: actorId
      };
      
      // Cache the result
      cache.set(cacheKey, actorData);
      
      res.json({
        success: true,
        data: actorData
      });
    } else {
      res.json({
        success: false,
        error: 'Actor not found'
      });
    }
  } catch (error) {
    console.error('Error fetching actor data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});