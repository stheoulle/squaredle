# Squaredle

A small static word-grid game. Drag across touching letters to find the four hidden words.

## Start with Docker

```bash
docker build -t squaredle .
docker run --rm -p 8080:80 squaredle
```

Open <http://localhost:8080>.

## Start without Docker

From this directory, run:

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080>.

The puzzle words and their tile paths are configured near the top of `app.js`.
