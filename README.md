# Forma

A premium, responsive fitness product built with React and Vite. Includes a weekly training calendar, guided session timer and exercise checklist, meal logging, recovery metrics, and locally saved profile preferences.

## Development

Requires Node.js 22 or newer.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

## Production

```sh
npm run build
npm run preview -- --port 4173
```

Fonts and hero artwork are bundled locally. No external services or credentials are required. Fitness metrics and coaching are demonstration data; this version does not connect to wearables or an AI backend. Meal and workout state lasts for the current session; profile preferences persist in local storage.
