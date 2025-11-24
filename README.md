# MealMind AI Web App

A modern, AI-powered recipe generation web application that helps users create personalized recipes based on their preferred cuisines and available ingredients. Built with React, TypeScript, Express, and MongoDB, featuring a beautiful, responsive UI inspired by the original Figma design.

**Original Design:** [Figma Design](https://www.figma.com/design/tWpnL8GrDnKDH3QwswjZbM/MealMind-AI-Web-App)

---

## 🎯 Overview

MealMind AI is a full-stack application consisting of:

- **Frontend**: React-based web application with TypeScript and Tailwind CSS
- **Backend**: Express.js server with TypeScript, MongoDB, and OpenAI integration

The application guides users through a simple 3-step process to generate personalized recipes. Users select their preferred cuisines, choose from available ingredients, and receive AI-generated recipes tailored to their selections.

---

## ✨ Features

### Core Functionality

- **Multi-Cuisine Selection**: Choose from 8 popular cuisines (Italian, Mexican, Chinese, Japanese, Indian, Thai, Mediterranean, French)
- **Smart Ingredient Filtering**: Automatically filters and displays relevant ingredients based on selected cuisines
- **Categorized Ingredients**: Ingredients organized by categories (Proteins, Vegetables, Herbs & Spices, Pantry, Dairy & Cheese, Condiments & Acids)
- **AI Recipe Generation**: Powered by OpenAI GPT models, generates complete recipes with:
  - Recipe name and description
  - Cuisine type and difficulty level
  - Prep time, cook time, and servings
  - Detailed ingredient list with quantities
  - Step-by-step cooking instructions
  - Chef's tips and recommendations
- **Recipe Caching**: Automatically caches generated recipes in database and browser storage
- **Fallback Support**: Gracefully falls back to template-based generation if AI is unavailable

### User Experience

- **Multi-Step Wizard**: Intuitive 3-step process (Cuisine Selection → Ingredient Selection → Recipe Generation)
- **Visual Feedback**: Loading animations and progress indicators during recipe generation
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop
- **Image Fallbacks**: Graceful handling of image loading errors with fallback UI
- **Navigation Controls**: Easy navigation between steps with back/forward buttons
- **Recipe Actions**: Print, share, and save recipe functionality

---

## 🏗️ Project Structure

```
MealMind AI Web App/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and service layers
│   │   ├── routes/        # Route configuration
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── build/             # Production build output
│   ├── package.json
│   └── README.md          # Client-specific documentation
│
├── server/                # Backend Express server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic (AI service)
│   │   ├── models/        # MongoDB models
│   │   ├── constants/     # Static data
│   │   ├── db/            # Database connection
│   │   └── types/         # TypeScript types
│   ├── dist/              # Compiled JavaScript
│   ├── package.json
│   └── README.md          # Server-specific documentation
│
├── package.json           # Root package.json with workspace scripts
└── README.md              # This file
```

---

## 🛠️ Tech Stack

### Frontend (Client)

- **React 18.3.1**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite 6.3.5**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Router DOM**: Client-side routing
- **Vitest**: Testing framework

### Backend (Server)

- **Express.js**: Web framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB**: Database with Mongoose ODM
- **OpenAI API**: AI-powered recipe generation
- **CORS**: Cross-origin resource sharing
- **Puppeteer**: PDF generation (optional)

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **pnpm** (recommended) or npm/yarn
- **MongoDB** (local installation or MongoDB Atlas account)
- **OpenAI API Key** (for AI recipe generation)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "MealMind AI Web App"
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   pnpm install

   # Install client dependencies
   cd client
   pnpm install

   # Install server dependencies
   cd ../server
   pnpm install
   ```

3. **Configure Backend Server**

   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `server/.env` and configure:

   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/mealmind
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mealmind
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```

4. **Seed the database** (first time setup)

   ```bash
   cd server
   pnpm seed
   ```

   This will populate MongoDB with initial data (cuisines, ingredients, templates).

5. **Start the development servers**

   **Option 1: Run separately** (recommended for development)

   ```bash
   # Terminal 1 - Backend Server
   cd server
   pnpm dev

   # Terminal 2 - Frontend Client
   cd client
   pnpm dev
   ```

   **Option 2: Use root scripts**

   ```bash
   # Terminal 1 - Backend Server
   pnpm dev:server

   # Terminal 2 - Frontend Client
   pnpm dev:client
   ```

6. **Open in browser**
   - Frontend: `http://localhost:5173` (or the port shown in terminal)
   - Backend API: `http://localhost:3001`

---

## 🚀 Development

### Frontend Development

See `client/README.md` for detailed frontend documentation including:

- Component architecture
- State management
- Routing
- Testing
- Linting

### Backend Development

See `server/README.md` for detailed backend documentation including:

- API endpoints
- Database models
- AI service integration
- Environment configuration

### Available Scripts

**Root level:**

- `pnpm dev:client` - Start frontend development server
- `pnpm dev:server` - Start backend development server

**Client (`cd client`):**

- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

**Server (`cd server`):**

- `pnpm dev` - Start server with hot reload
- `pnpm build` - Compile TypeScript
- `pnpm start` - Start production server
- `pnpm seed` - Seed database with initial data
- `pnpm type-check` - Type check without building

---

## 🌐 API Endpoints

### Health Check

- **GET** `/health` - Returns server status

### Cuisines

- **GET** `/api/cuisines` - Returns all available cuisines
- **GET** `/api/cuisines/:id` - Returns a specific cuisine by ID

### Ingredients

- **GET** `/api/ingredients` - Returns all available ingredients
- **GET** `/api/ingredients/:id` - Returns a specific ingredient by ID
- **GET** `/api/ingredients/by-cuisine/:cuisineId` - Returns ingredients filtered by cuisine
- **GET** `/api/ingredients/category/:category` - Returns ingredients filtered by category

### Recipe Templates

- **GET** `/api/recipe-templates` - Returns all recipe templates
- **GET** `/api/recipe-templates/:cuisineId` - Returns recipe template for a specific cuisine

### Recipe Generation

- **POST** `/api/recipes/generate` - Generates a recipe using AI
  - **Body**: `{ "cuisines": ["italian"], "ingredients": ["tomato", "pasta"] }`
  - **Query Parameters**: `?model=gpt-4o-mini` (optional)

For detailed API documentation, see `server/README.md`.

---

## 🗄️ Database

- **MongoDB** is used for data persistence
- All static data (cuisines, ingredients, templates) is stored in MongoDB
- Generated recipes are automatically saved to the database
- Run `pnpm seed` in the server directory to populate initial data
- See `server/MIGRATION.md` for detailed migration guide

---

## 🔧 Configuration

### Environment Variables

**Server** (`server/.env`):

- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string (required)
- `OPENAI_API_KEY` - OpenAI API key (required for AI generation)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-4o-mini)

**Client** (`client/.env`):

- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

---

## 🧪 Testing

### Frontend Tests

```bash
cd client
pnpm test          # Run tests
pnpm test:ui       # Run tests with UI
```

### Backend Tests

Currently, backend tests are not configured. Consider adding Jest or Vitest for server-side testing.

---

## 📝 Code Quality

### Linting

**Frontend:**

```bash
cd client
pnpm lint          # Check for linting errors
pnpm lint:fix      # Auto-fix linting errors
```

The frontend uses ESLint with Husky pre-commit hooks for code quality.

### Type Checking

**Backend:**

```bash
cd server
pnpm type-check    # Type check without building
```

---

## 🚢 Production Build

### Frontend

```bash
cd client
pnpm build
```

Production build will be output to `client/build/` directory.

### Backend

```bash
cd server
pnpm build
pnpm start
```

Compiled JavaScript will be output to `server/dist/` directory.

---

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Maintain TypeScript type safety
3. Ensure responsive design compatibility
4. Test across different screen sizes
5. Follow accessibility best practices
6. Update documentation as needed

---

## 📄 License

This project is private and proprietary.

---

## 🔗 Links

- **Original Design**: [Figma Design](https://www.figma.com/design/tWpnL8GrDnKDH3QwswjZbM/MealMind-AI-Web-App)
- **Client Documentation**: See `client/README.md`
- **Server Documentation**: See `server/README.md`
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Express Documentation**: https://expressjs.com/
- **MongoDB Documentation**: https://www.mongodb.com/docs/

---

## 📧 Support

For questions or issues, please refer to the project repository or contact the development team.

---

**Made with ❤️ for food lovers**

brew services start mongodb-community
brew services stop mongodb-community
