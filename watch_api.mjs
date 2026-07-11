import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const TMDB_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// UK provider name -> affiliate URL mapping
const AFFILIATE = {
  'Amazon Prime Video': 'https://www.amazon.co.uk/amazonprime?tag=coupn28-21',
  'Amazon Prime Video with Ads': 'https://www.amazon.co.uk/amazonprime?tag=coupn28-21',
  'Amazon Video': 'https://www.amazon.co.uk/s?k={title}&tag=coupn28-21',
  'Netflix': 'https://www.netflix.com/',
  'Disney+': 'https://www.disneyplus.com/',
  'Apple TV': 'https://tv.apple.com/',
  'Apple TV Store': 'https://tv.apple.com/',
  'Google Play Movies': 'https://play.google.com/store/movies',
  'Sky Store': 'https://www.sky.com/store',
  'YouTube': 'https://www.youtube.com/',
  'BBC iPlayer': 'https://www.bbc.co.uk/iplayer',
  'ITVX': 'https://www.itv.com/watch',
  'Channel 4': 'https://www.channel4.com/',
  'Now TV': 'https://www.nowtv.com/',
  'Paramount+': 'https://www.paramountplus.com/',
};

const UK_PROVIDER_IDS = {};

// Search movies & TV
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json({ results: [] });

    const [moviesRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE}/search/movie?query=${encodeURIComponent(q)}&language=en-GB&page=1&api_key=${TMDB_KEY}`).then(r => r.json()),
      fetch(`${TMDB_BASE}/search/tv?query=${encodeURIComponent(q)}&language=en-GB&page=1&api_key=${TMDB_KEY}`).then(r => r.json())
    ]);

    const results = [];

    (moviesRes.results || []).slice(0, 6).forEach(m => {
      results.push({
        id: m.id,
        title: m.title,
        year: (m.release_date || '').substring(0, 4),
        type: 'movie',
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : null,
        overview: m.overview || '',
      });
    });

    (tvRes.results || []).slice(0, 4).forEach(t => {
      results.push({
        id: t.id,
        title: t.name,
        year: (t.first_air_date || '').substring(0, 4),
        type: 'tv',
        poster: t.poster_path ? `https://image.tmdb.org/t/p/w185${t.poster_path}` : null,
        overview: t.overview || '',
      });
    });

    res.json({ results: results.slice(0, 8) });
  } catch (e) {
    res.json({ results: [{ title: req.query.q, year: '', type: 'movie', poster: null, overview: '', providers: [] }] });
  }
});

// Get watch providers for a specific title
app.get('/api/providers', async (req, res) => {
  try {
    const { id, type } = req.query;
    const endpoint = type === 'tv' ? 'tv' : 'movie';

    const data = await fetch(`${TMDB_BASE}/${endpoint}/${id}/watch/providers?api_key=${TMDB_KEY}`).then(r => r.json());
    const results = data.results || {};
    const gb = results.GB || {};

    const providers = [];
    const addProvider = (items, availability) => {
      (items || []).forEach(p => {
        providers.push({
          provider_id: p.provider_id,
          name: p.provider_name,
          logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
          availability,
          affiliateUrl: AFFILIATE[p.provider_name] || null,
        });
      });
    };

    addProvider(gb.flatrate, 'Stream');
    addProvider(gb.rent, 'Rent');
    addProvider(gb.buy, 'Buy');

    res.json({ providers: providers.slice(0, 12) });
  } catch (e) {
    res.json({ providers: [] });
  }
});

// Search music via iTunes (free, no key)
app.get('/api/search-music', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json({ results: [] });

    const data = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&limit=6&country=GB&media=music&entity=song`).then(r => r.json());

    const results = (data.results || []).map(r => ({
      title: r.trackName,
      artist: r.artistName,
      album: r.collectionName,
      artwork: r.artworkUrl100 ? r.artworkUrl100.replace('100x100', '300x300') : null,
      previewUrl: r.previewUrl,
      type: 'song',
      buyUrl: `https://www.amazon.co.uk/s?k=${encodeURIComponent(r.trackName + ' ' + r.artistName)}&tag=coupn28-21`,
    }));

    res.json({ results });
  } catch (e) {
    res.json({ results: [] });
  }
});

// Get popular movies (fallback)
app.get('/api/popular', async (req, res) => {
  try {
    const type = req.query.type || 'movie';
    const endpoint = type === 'tv' ? 'tv/popular' : 'movie/popular';
    const data = await fetch(`${TMDB_BASE}/${endpoint}?language=en-GB&page=1&api_key=${TMDB_KEY}`).then(r => r.json());
    
    const results = (data.results || []).slice(0, 8).map(m => ({
      id: m.id,
      title: m.title || m.name,
      year: (m.release_date || m.first_air_date || '').substring(0, 4),
      type: type === 'tv' ? 'tv' : 'movie',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : null,
      overview: m.overview || '',
    }));

    res.json({ results });
  } catch (e) {
    res.json({ results: [] });
  }
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tmdb: 'configured' });
});

app.listen(3005, () => console.log('WatchFinder API on port 3005'));
