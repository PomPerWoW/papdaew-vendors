# Vendors Service

## Overview

Vendors service for Papdaew. This service handles vendor management, store information, and vendor-specific operations. It works in conjunction with other services through message queues.

## Table of Contents

- [Vendors Service](#vendors-service)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)

## Features

- Vendor management
- Store information storage and retrieval
- Vendor verification and approval workflows
- Store analytics and reporting (planned)

## Tech Stack

- Node.js

## Project Structure

```
services/papdaew-users/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── configs/
│   ├── server.js
│   └── app.js
├── tests/
├── .editorconfig
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

4. Database Setup:

   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up -d postgres

   # Run database migrations
   npx prisma migrate dev
   ```

5. Run the service:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```
