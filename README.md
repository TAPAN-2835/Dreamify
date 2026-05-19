# Dreamify — AI Image Generation Platform

<div align="center">

### Production-grade AI image generation platform with distributed workers, real-time updates, secure billing, and scalable infrastructure.

<br/>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-13AA52?style=for-the-badge\&logo=mongodb\&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-D92D2A?style=for-the-badge\&logo=redis\&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge\&logo=socketdotio\&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-EA4C89?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge\&logo=stripe\&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge\&logo=cloudinary\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

<br/>

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-Distributed-blueviolet?style=flat-square)
![Realtime](https://img.shields.io/badge/Realtime-Socket.io-orange?style=flat-square)
![Queue](https://img.shields.io/badge/Queue-BullMQ-red?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

Dreamify is a modern AI-powered image generation platform engineered with a distributed backend architecture for scalability and production deployment.

The platform combines:

* Real-time Socket.io updates
* Distributed BullMQ workers
* Redis-backed job queues
* Secure Stripe billing
* Cloudinary CDN delivery
* Admin analytics
* Enterprise-grade security hardening

The system is designed to process high-concurrency AI workloads asynchronously without blocking the main Node.js event loop.

---

## Core Features

### AI Image Generation

* AI-powered text-to-image generation
* Asynchronous generation pipeline
* Prompt optimization workflow
* Retry and failure handling
* Intelligent generation caching

### Real-Time Infrastructure

* Socket.io live progress updates
* Real-time job synchronization
* Private user socket rooms
* Zero polling architecture

### Distributed Queue System

* BullMQ background processing
* Redis-backed reliable queues
* Exponential retry/backoff
* Queue prioritization support
* Cancelable generation jobs

### Image Processing Pipeline

* Automatic WebP conversion
* Thumbnail generation
* Blur placeholder previews (LQIP)
* Cloudinary CDN delivery
* Optimized media compression

### Billing & Credits

* Stripe Checkout integration
* Secure webhook verification
* Credit ledger system
* Atomic balance mutations
* Transaction history tracking

### Admin Analytics

* Revenue monitoring
* Queue analytics
* Generation statistics
* User leaderboards
* Performance insights

### Security

* Helmet security hardening
* API rate limiting
* JWT authentication
* Secure cookies
* Environment validation
* Protected admin routes
* Centralized error handling

---

## System Architecture

```text
                    ┌────────────────────┐
                    │     React SPA      │
                    │   Vite Frontend    │
                    └─────────┬──────────┘
                              │
                     Socket.io│REST API
                              │
              ┌───────────────▼────────────────┐
              │        Express Server          │
              │  Auth • Billing • API • IO    │
              └───────────────┬────────────────┘
                              │
                Queue Jobs    │    Real-time Events
                              │
                    ┌─────────▼─────────┐
                    │    Redis Broker   │
                    │   BullMQ Queue    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Worker Process   │
                    │ AI Generation Job │
                    └─────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐        ┌────────▼────────┐
        │   Cloudinary   │        │    MongoDB      │
        │  Image Storage │        │ Persistent Data │
        └────────────────┘        └─────────────────┘
```

---

## Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* Framer Motion
* Socket.io Client
* Recharts

### Backend

* Node.js
* Express.js
* Socket.io
* JWT Authentication
* Helmet

### Database & Storage

* MongoDB + Mongoose
* Redis
* Cloudinary

### Queue & Workers

* BullMQ
* Redis Workers
* Sharp Image Processing

### Payments

* Stripe Checkout
* Stripe Webhooks

### DevOps & Infrastructure

* Docker
* PM2
* GitHub Actions
* Morgan Logging

---

## Production Engineering Highlights

### Secure Stripe Architecture

Dreamify uses a secure webhook-based payment flow.

* Frontend never grants credits
* Stripe webhook verifies signatures
* Duplicate processing is prevented
* Transactions are immutable

### Distributed AI Processing

Heavy AI workloads never block the API server.

Workflow:

1. API validates request
2. Job enters BullMQ queue
3. Worker processes generation
4. Socket emits progress updates
5. Cloudinary stores optimized image
6. Result streams back instantly

### Real-Time Updates Without Polling

The frontend receives:

* Queue progress
* Generation states
* Completion updates
* Error states

through Socket.io private rooms in real time.

### Optimized Media Pipeline

Generated images are:

* Converted to WebP
* CDN-hosted on Cloudinary
* Thumbnail optimized
* Blur-preview enhanced
* Cached for duplicate prompts

---

## Project Structure

```bash
Dreamify/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── server/                 # Express Backend
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── workers/
│   ├── queues/
│   ├── config/
│   └── lib/
│
├── docker-compose.yml
├── ecosystem.config.js
└── README.md
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/dreamify.git

cd dreamify
```

---

### 2. Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

---

### 3. Configure Environment Variables

Create `.env` inside `/server`

```env
PORT=4000

MONGODB_URI=
REDIS_URL=

JWT_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIPDROP_API_KEY=

CLIENT_URL=http://localhost:5173
```

---

### 4. Run Development Servers

#### Start Backend

```bash
npm run dev
```

#### Start Worker

```bash
npm run worker
```

#### Start Frontend

```bash
npm run dev
```

---

## Docker Setup

```bash
docker-compose up --build
```

Services:

* MongoDB
* Redis
* Express API
* Worker
* React Client

---

## Admin Features

* Queue monitoring dashboard
* Revenue analytics
* Daily generation tracking
* Top user leaderboard
* Credit adjustment tools
* Worker health monitoring

---

## Security Features

* JWT Authentication
* HTTPOnly Secure Cookies
* Stripe Signature Verification
* API Rate Limiting
* Helmet Protection
* Centralized Error Handling
* Environment Validation
* Admin Route Protection
* CORS Hardening

---

## Scalability Design

Dreamify is engineered for horizontal scaling:

* Multiple worker processes
* Distributed Redis queues
* Stateless Express APIs
* CDN-delivered assets
* Socket.io room architecture
* Optimized database indexing

---

## Testing

```bash
npm test
```

Includes:

* API integration tests
* Stripe webhook tests
* Queue tests
* Worker tests
* Controller unit tests

---

## Deployment

Production deployment supports:

* Docker containers
* PM2 clustering
* Nginx reverse proxy
* CI/CD pipelines
* GitHub Actions workflows

---

## Future Roadmap

* AI style presets
* Team workspaces
* Multi-provider AI routing
* Voice prompt generation
* Mobile application
* WebRTC collaboration
* AI prompt enhancement engine

---
