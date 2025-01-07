# Multi-Container JavaScript Code Execution Platform

A secure containerized application that allows users to execute JavaScript code snippets in an isolated environment. Built with React, Node.js, and Docker.

## Project Overview

This project demonstrates practical implementation of:
- Multi-container Docker architecture
- Frontend/Backend separation
- Secure code execution
- Database persistence
- Caching mechanisms
- Container orchestration

## Core Components

1. **Frontend Container (React + Nginx)**
   - Modern React application
   - Bootstrap UI framework
   - Production-grade Nginx server

2. **Backend Container (Node.js)**
   - Express.js API
   - Secure code execution using VM2
   - Logging with Pino

3. **Database Container (PostgreSQL)**
   - Stores execution history
   - Persists statistics

4. **Cache Container (Redis)**
   - Caches execution results
   - Improves response times

## Running the Project

### Prerequisites
- Docker Desktop (latest version)
- Git

### Step-by-Step Deployment

1. Clone the repository:
```bash
git clone https://github.com/zlpkhr/multico
cd multico
```

2. Start the application:
```bash
docker compose up --build
```

3. Access the application:
- Web Interface: http://localhost:8080
- API Endpoint: http://localhost:3000 (internal)

### Verification Steps

1. Open the web interface
2. Enter a JavaScript code snippet
3. Execute the code
4. View execution statistics and history

## Architecture Details

```
[Frontend Container] --> [Backend Container] --> [Redis Cache]
                                           --> [PostgreSQL Database]
```

- Frontend runs on port 8080
- Backend runs on port 3000 (internal)
- Redis and PostgreSQL are only accessible within the container network

## Security Features

- Isolated code execution environment
- Non-root container users
- Network segregation
- Environment variable isolation

## Technical Specifications

### Frontend Container
- Node.js 20 (build environment)
- Nginx (production server)
- React 18
- Bootstrap 5

### Backend Container
- Node.js 20 Alpine
- Express.js
- VM2 for code execution
- Pino logging

### Data Persistence
- PostgreSQL 15
- Redis Alpine
- Docker volumes for data persistence

## Environment Configuration

All configuration is handled through Docker Compose environment variables:

```yaml
REDIS_HOST=redis
POSTGRES_HOST=postgres
API_URL=http://backend:3000
# Additional variables configured in docker-compose.yml
```

## Project Structure
```
.
├── apps/
│   ├── alpha/          # Frontend application
│   └── beta/           # Backend application
└── docker-compose.yml  # Container orchestration
```
