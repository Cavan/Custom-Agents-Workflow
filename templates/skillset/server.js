'use strict';

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Serve the skill manifest so GitHub Copilot can discover your skills.
// Register this URL in your GitHub App settings under Copilot > Manifest URL.
// ---------------------------------------------------------------------------
app.get('/manifest.json', (req, res) => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8')
  );
  res.json(manifest);
});

// ---------------------------------------------------------------------------
// Skill: getWeather
// Receives: { parameters: { city: string } }
// Returns:  { temperature, condition, city }
//
// Replace the fake data below with a real weather API call, e.g.:
//   const data = await fetch(`https://api.openweathermap.org/...`);
// ---------------------------------------------------------------------------
app.post('/skills/getWeather', (req, res) => {
  const { city } = req.body.parameters || {};

  if (!city) {
    return res.status(400).json({ error: 'city parameter is required' });
  }

  // TODO: replace with a real weather API call
  const fakeWeather = {
    city,
    temperature: '18°C',
    condition: 'Partly cloudy',
    humidity: '65%',
  };

  res.json(fakeWeather);
});

// ---------------------------------------------------------------------------
// Skill: searchDocs
// Receives: { parameters: { query: string, maxResults?: number } }
// Returns:  { results: Array<{ title, snippet, url }> }
//
// Replace the fake results below with a real search call, e.g.:
//   const results = await yourSearchEngine.query(query, maxResults);
// ---------------------------------------------------------------------------
app.post('/skills/searchDocs', (req, res) => {
  const { query, maxResults = 5 } = req.body.parameters || {};

  if (!query) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  // TODO: replace with a real documentation search
  const fakeResults = Array.from({ length: Math.min(maxResults, 3) }, (_, i) => ({
    title: `Document ${i + 1} matching "${query}"`,
    snippet: `This is a placeholder snippet for result ${i + 1}. Replace with real content.`,
    url: `https://docs.example.com/articles/${i + 1}`,
  }));

  res.json({ results: fakeResults });
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Skillset server running on http://localhost:${PORT}`);
  console.log(`Manifest URL: http://localhost:${PORT}/manifest.json`);
});
