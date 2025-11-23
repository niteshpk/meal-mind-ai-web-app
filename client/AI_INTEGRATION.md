# Backend API Integration Guide

## Overview

The MealMind AI Web App now uses a **backend server** for AI-powered recipe generation. All OpenAI integration has been moved to the server for better security and architecture. The frontend communicates with the backend API using REST endpoints.

## Architecture

### Client-Server Architecture

```
Frontend (Client)          Backend Server (Server)
┌─────────────────┐        ┌──────────────────┐
│                 │        │                  │
│ RecipeService   │───────▶│  API Routes      │
│                 │  HTTP │                  │
│ APIService      │◀───────│  AIService       │
│                 │        │                  │
│                 │        │  OpenAI API      │
└─────────────────┘        └──────────────────┘
```

### Frontend Services

#### `RecipeService` (`src/services/recipe-service.ts`)
- Main interface for recipe generation
- Calls backend API endpoint `/api/recipes/generate`
- Falls back to template-based generation if API is unavailable
- No direct OpenAI integration

#### `APIService` (`src/services/api-service.ts`)
- Handles communication with backend API
- Fetches static data (cuisines, ingredients, templates)
- Provides fallback to local constants if API unavailable

#### `RecipeStorageService` (`src/services/recipe-storage.ts`)
- Caches generated recipes in browser localStorage
- Provides client-side caching for better UX
- Can be extended to sync with backend in the future

### Backend Services

All OpenAI integration is handled on the server:
- **Server**: `server/src/services/ai-service.ts`
- **API Routes**: `server/src/routes/recipes.ts`
- **TOON Format**: Server uses TOON format for efficient AI communication

## Setup Instructions

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` and add your OpenAI API key**:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   PORT=3001
   ```

5. **Start the server**:
   ```bash
   pnpm dev
   ```

### Frontend Setup

1. **Configure API URL** (if different from default):
   ```bash
   # In client/.env
   VITE_API_URL=http://localhost:3001
   ```

2. **Start the frontend**:
   ```bash
   cd client
   pnpm dev
   ```

## API Endpoints

### Recipe Generation
- **POST** `/api/recipes/generate`
  - Body: `{ cuisines: string[], ingredients: string[] }`
  - Query: `?model=gpt-4o-mini` (optional)

### Static Data
- **GET** `/api/cuisines` - Get all cuisines
- **GET** `/api/ingredients` - Get all ingredients
- **GET** `/api/ingredients/by-cuisine/:cuisineId` - Get ingredients by cuisine
- **GET** `/api/recipe-templates` - Get recipe templates

## Benefits of Backend Architecture

1. **Security**: API keys never exposed to client
2. **Cost Control**: Centralized API usage monitoring
3. **Rate Limiting**: Can be implemented on server
4. **Caching**: Server-side caching possible
5. **Scalability**: Easier to scale backend independently

## Migration Notes

- ✅ OpenAI SDK removed from client
- ✅ All AI calls now go through backend API
- ✅ Frontend maintains fallback to templates
- ✅ Client-side caching still available
- ✅ API service handles all backend communication

## Troubleshooting

### API Connection Issues
- Check if server is running on correct port
- Verify `VITE_API_URL` in client config
- Check CORS settings on server

### Recipe Generation Fails
- Verify OpenAI API key in server `.env`
- Check server logs for errors
- Frontend will fallback to templates automatically

## Next Steps

- Implement server-side caching
- Add rate limiting
- Add user authentication
- Implement recipe history on backend
