# Backend API - ERP Gestão OS

This is the backend service for the ERP Gestão OS application, built with NestJS and integrated with Supabase/PostgreSQL.

## Directory Structure

The backend is completely isolated from the frontend and resides inside the `/backend` directory.

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Setup & Execution

You must run these commands **from inside the `/backend` directory**.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Start the service in development mode (with watch mode):**
   ```bash
   npm run start:dev
   ```

4. **Start the service in normal mode:**
   ```bash
   npm run start
   ```

The server will start and run on `//erp-gest-o-os-jbpi9dvj8.onrender.com`.

## Endpoints

- `GET /health`
  - Returns: `API running`
  - Purpose: System health check endpoint.

## Database Integration

The backend connects to Supabase/PostgreSQL on initialization using the `SupabaseService`. It relies on environment variables (`SUPABASE_URL` and `SUPABASE_KEY` or their `VITE_` prefixed variants) to authenticate.
