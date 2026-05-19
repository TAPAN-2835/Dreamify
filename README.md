Dreamify — AI image generation studio (web + API + worker) with real-time progress, billing and queueing.

This repository contains the full-stack Dreamify application: a React + Vite front-end, an Express API server, background image-generation workers (BullMQ + Redis), and supporting infra (MongoDB, Cloudinary, Stripe). It's designed for production readiness with Docker, CI, PM2 config, and tests.

---

## Table of contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started (local)](#getting-started-local)
- [Docker / Production](#docker--production)
- [Environment variables](#environment-variables)
- [Testing](#testing)
- [Deployment & CI](#deployment--ci)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Real-time generation progress via Socket.io (no polling)
- Background queue processing with BullMQ and Redis
- WebP conversion, thumbnails, and LQIP blur placeholders (sharp)
- Prompt caching to reduce duplicate generation costs
- Cancelable jobs and generation retry/error flows
- Stripe Checkout + webhook-based credit provisioning
- Admin queue dashboard (Bull Board)
- Production-ready: Dockerfiles, nginx proxy config, `docker-compose.yml` and PM2 ecosystem

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- API: Node.js, Express
- Realtime: Socket.io
- Queue: BullMQ (workers) + Redis
- Storage: MongoDB (Mongoose), Cloudinary (image hosting)
- Image processing: sharp (WebP, thumbnails, LQIP)
- Billing: Stripe Checkout + webhooks
- CI: GitHub Actions
- Containers / Runtime: Docker, Nginx, PM2
- Testing: Jest, Supertest

Suggested repository topics / tags: `react`, `vite`, `tailwindcss`, `framer-motion`, `nodejs`, `express`, `socket.io`, `bullmq`, `redis`, `mongodb`, `cloudinary`, `stripe`, `sharp`, `docker`, `ci`, `jest`, `supertest`.

## Architecture
High-level overview:
- Client (SPA) — user prompts, result preview, history, billing pages.
- Server (Express) — REST API, Stripe webhook, authentication, and exposes `io` for workers.
- Workers — dequeue generation jobs, call AI provider, process images (sharp), upload to Cloudinary, and emit socket updates.
- Queue & Broker — BullMQ backed by Redis for reliable background processing.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [SOCKET_ARCHITECTURE.md](SOCKET_ARCHITECTURE.md) for more details.

## Getting started (local)
Prerequisites: Node.js 18+, Docker (if using docker-compose), Redis, MongoDB.

1. Clone the repo

```bash
git clone <your-repo-url> dreamify
cd dreamify
```

2. Copy environment example and set secrets

```bash
cp .env.example .env
# edit .env and set keys (Cloudinary, Stripe, MongoDB, Clipdrop, etc.)
```

3. Install and run services locally (dev mode)

Server
```bash
cd server
npm ci
npm run dev
```

Client
```bash
cd client
npm ci
npm run dev
```

Workers
```bash
cd server
npm run worker
```

Notes:
- The server exposes `/health` for quick checks.
- The client expects the backend URL via environment variables (see `client/README` or `client/package.json` scripts).

## Docker / Production
Build and run everything with `docker-compose` (development or simple production stack):

```bash
docker-compose up --build -d
```

Services started:
- `mongo`, `redis`, `server` (port 4000), `client` (port 80)

For production, ensure you run behind a TLS terminator and set all environment variables securely. See `ecosystem.config.js` for PM2-based process management and `.github/workflows/ci.yml` for CI wiring.

## Environment variables
Copy `.env.example` to `.env` and populate values. Key variables used include:
- `MONGODB_URI`, `REDIS_URL`
- `JWT_SECRET`
- `CLIPDROP_API_KEY` (or other AI provider key)
- `CLOUDINARY_*` keys
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Testing
Server tests use Jest + Supertest. Run from the `server` folder:

```bash
cd server
npm ci
npm test
```

We include tests for the health endpoint, Stripe webhook handling (mocked), and a safe import test for the worker module.

## Deployment & CI
- GitHub Actions workflow `/.github/workflows/ci.yml` performs install and client build steps on push/pull requests.
- For full CI: extend the workflow to run `server` tests and run linting steps.
- Use the provided `Dockerfile`s and `docker-compose.yml` for containerized deployments.

## Contributing
1. Open an issue to discuss features or bugs.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests and linters locally.
4. Open a PR and request reviews; ensure CI passes.

## Contact
Author / Maintainer: (add your name and contact info here)

## License
This project is released under the MIT License. Replace or update as appropriate for your organization.
