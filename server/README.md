# MealMind AI Server

Express TypeScript backend server for MealMind AI Web App.

## Features

- **OpenAI Integration**: AI-powered recipe generation using TOON format
- **RESTful API**: Clean API endpoints for recipes and static data
- **TypeScript**: Fully typed codebase
- **CORS Enabled**: Ready for frontend integration

## Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. **Install dependencies**:
   ```bash
   cd server
   pnpm install
   # or
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` and configure**:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/mealmind
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Seed the database** (first time setup):
   ```bash
   pnpm seed
   ```
   This will migrate all hardcoded data to MongoDB.

### Running the Server

**Development mode** (with hot reload):
```bash
pnpm dev
# or
npm run dev
```

**Production mode**:
```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns server status

### Cuisines
- **GET** `/api/cuisines`
  - Returns all available cuisines
- **GET** `/api/cuisines/:id`
  - Returns a specific cuisine by ID

### Ingredients
- **GET** `/api/ingredients`
  - Returns all available ingredients
- **GET** `/api/ingredients/:id`
  - Returns a specific ingredient by ID
- **GET** `/api/ingredients/by-cuisine/:cuisineId`
  - Returns ingredients filtered by cuisine
- **GET** `/api/ingredients/category/:category`
  - Returns ingredients filtered by category

### Recipe Templates
- **GET** `/api/recipe-templates`
  - Returns all recipe templates and related data
- **GET** `/api/recipe-templates/:cuisineId`
  - Returns recipe template for a specific cuisine
- **GET** `/api/recipe-templates/ingredient-map`
  - Returns the ingredient amount mapping
- **GET** `/api/recipe-templates/default-instructions`
  - Returns default cooking instructions
- **GET** `/api/recipe-templates/default-tips`
  - Returns default cooking tips
- **GET** `/api/recipe-templates/cuisine-names`
  - Returns cuisine name mapping

### Recipe Generation
- **POST** `/api/recipes/generate`
  - Generates a recipe using AI
  - **Body**:
    ```json
    {
      "cuisines": ["italian", "mexican"],
      "ingredients": ["tomato", "pasta", "garlic"]
    }
    ```
  - **Query Parameters** (optional):
    - `model`: OpenAI model to use (default: `gpt-4o-mini`)
  - **Response**:
    ```json
    {
      "success": true,
      "recipe": {
        "name": "Recipe Name",
        "description": "...",
        "cuisine": "Italian",
        "prepTime": "15",
        "cookTime": "20",
        "servings": 4,
        "difficulty": "Medium",
        "ingredients": [...],
        "instructions": [...],
        "tips": [...]
      }
    }
    ```

## Project Structure

```
server/
├── src/
│   ├── constants/          # Static data (cuisines, ingredients, templates)
│   ├── routes/             # API route handlers (organized by resource)
│   │   ├── cuisines.ts     # Cuisine endpoints
│   │   ├── ingredients.ts  # Ingredient endpoints
│   │   ├── recipe-templates.ts # Recipe template endpoints
│   │   └── recipes.ts      # Recipe generation endpoints
│   ├── services/           # Business logic (AI service)
│   ├── types/              # TypeScript type definitions
│   └── index.ts            # Server entry point
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env.example
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string (required)
  - Local: `mongodb://localhost:27017/mealmind`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/mealmind`
- `OPENAI_API_KEY`: Your OpenAI API key (required for recipe generation)
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4o-mini)

## Development

### Type Checking
```bash
pnpm type-check
```

### Building
```bash
pnpm build
```

## Database

- All data is stored in MongoDB
- Run `pnpm seed` to populate initial data from constants
- Generated recipes are automatically saved to database
- See `MIGRATION.md` for detailed migration guide

## Notes

- The server uses **TOON format** for AI responses to reduce token usage
- All endpoints now fetch from MongoDB instead of hardcoded constants
- Generated recipes are cached in database (checked before generating new ones)
- API key is required for recipe generation; endpoints will return errors if not configured
- CORS is enabled for all origins (configure in production)

