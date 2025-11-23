# MealMind AI Web App

A modern, AI-powered recipe generation web application that helps users create personalized recipes based on their preferred cuisines and available ingredients. Built with React, TypeScript, and Tailwind CSS, featuring a beautiful, responsive UI inspired by the original Figma design.

**Original Design:** [Figma Design](https://www.figma.com/design/tWpnL8GrDnKDH3QwswjZbM/MealMind-AI-Web-App)

---

## 🎯 Overview

MealMind AI is an interactive web application that guides users through a simple 3-step process to generate personalized recipes. Users select their preferred cuisines, choose from available ingredients, and receive AI-generated recipes tailored to their selections.

---

## ✨ Features

### Core Functionality

- **Multi-Cuisine Selection**: Choose from 8 popular cuisines (Italian, Mexican, Chinese, Japanese, Indian, Thai, Mediterranean, French)
- **Smart Ingredient Filtering**: Automatically filters and displays relevant ingredients based on selected cuisines
- **Categorized Ingredients**: Ingredients organized by categories (Proteins, Vegetables, Herbs & Spices, Pantry, Dairy & Cheese, Condiments & Acids)
- **AI Recipe Generation**: Generates complete recipes with:
  - Recipe name and description
  - Cuisine type and difficulty level
  - Prep time, cook time, and servings
  - Detailed ingredient list with quantities
  - Step-by-step cooking instructions
  - Chef's tips and recommendations

### User Experience

- **Multi-Step Wizard**: Intuitive 3-step process (Cuisine Selection → Ingredient Selection → Recipe Generation)
- **Visual Feedback**: Loading animations and progress indicators during recipe generation
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop
- **Image Fallbacks**: Graceful handling of image loading errors with fallback UI
- **Navigation Controls**: Easy navigation between steps with back/forward buttons
- **Recipe Actions**: Print, share, and save recipe functionality (UI ready)

### UI/UX Features

- **Modern Design System**: Built with Radix UI components and custom Tailwind CSS styling
- **Accessible Components**: WCAG-compliant UI components with proper ARIA attributes
- **Smooth Animations**: CSS transitions and animations for enhanced user experience
- **Color-Coded Badges**: Visual indicators for cuisine types, difficulty levels, and recipe status
- **Sticky Navigation**: Header remains accessible while scrolling
- **Hero Section**: Engaging landing page with call-to-action

---

## 🏗️ Architecture

### Application Structure

```
MealMind AI Web App/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components (Radix UI based)
│   │   ├── figma/                 # Figma-specific components
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx         # Application header/navigation
│   │   │   ├── Footer.tsx          # Application footer
│   │   │   └── PageLayout.tsx     # Page layout wrapper
│   │   ├── features/              # Feature-specific components
│   │   │   ├── recipe/            # Recipe-related components
│   │   │   │   └── RecipeOutput.tsx
│   │   │   └── selection/        # Selection-related components
│   │   │       ├── CuisineSelection.tsx
│   │   │       └── IngredientSelection.tsx
│   │   ├── Landing.tsx            # Landing page component
│   │   ├── AILoading.tsx          # Loading state during recipe generation
│   │   └── ErrorBoundary.tsx     # Error boundary component
│   ├── contexts/
│   │   └── RecipeContext.tsx      # Global state management context
│   ├── hooks/
│   │   ├── useSelection.ts        # Generic selection hook
│   │   └── useNavigation.ts       # Navigation hook
│   ├── services/
│   │   └── recipe-service.ts      # Recipe generation service
│   ├── routes/
│   │   └── index.tsx              # Route configuration
│   ├── types/
│   │   ├── index.ts               # Type definitions
│   │   └── errors.ts              # Error types
│   ├── constants/
│   │   ├── cuisines.ts            # Cuisine data
│   │   ├── ingredients.ts         # Ingredient data
│   │   └── recipe-templates.ts    # Recipe templates
│   ├── utils/
│   │   ├── format.ts              # Formatting utilities
│   │   └── validation.ts          # Validation utilities
│   ├── config/
│   │   └── index.ts               # Environment configuration
│   ├── test-utils.tsx             # Testing utilities
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles & Tailwind CSS
│   └── styles/
│       └── globals.css            # Additional global styles
├── index.html                     # HTML template
├── vite.config.ts                 # Vite build configuration
├── vitest.config.ts               # Vitest test configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

### State Management

The application uses React Context API for global state management:

- **RecipeContext**: Centralized state management for:
  - Current screen navigation
  - Selected cuisines and ingredients
  - Generated recipe data
  - All state management functions (toggle, generate, reset)

### Routing

The application uses React Router for navigation:

- **Routes**: `/`, `/cuisine`, `/ingredients`, `/loading`, `/recipe`
- **Navigation**: Uses `useNavigate` hook for programmatic navigation
- **Route Protection**: Recipe route checks for recipe data availability

### Component Hierarchy

```
ErrorBoundary
└── RecipeProvider (Context)
    └── BrowserRouter
        └── AppRoutes
            ├── Header (Layout)
            ├── Main Content (Routes)
            │   ├── Landing (/)
            │   ├── CuisineSelection (/cuisine)
            │   ├── IngredientSelection (/ingredients)
            │   ├── AILoading (/loading)
            │   └── RecipeOutput (/recipe)
            └── Footer (Layout)
```

### Data Flow

1. **User selects cuisines** → Updates `selectedCuisines` in RecipeContext
2. **User navigates to ingredients** → React Router navigates to `/ingredients`
3. **Ingredients filtered** → Based on selected cuisines from context
4. **User selects ingredients** → Updates `selectedIngredients` in RecipeContext
5. **User generates recipe** → Calls `generateRecipe()` from context
6. **Loading state** → Navigates to `/loading` route
7. **Recipe generated** → RecipeService generates recipe
8. **Recipe displayed** → Navigates to `/recipe` route with recipe data

---

## 🛠️ Tech Stack

### Core Technologies

- **React 18.3.1**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite 6.3.5**: Build tool and dev server
- **Tailwind CSS 4.1.3**: Utility-first CSS framework

### UI Component Libraries

- **Radix UI**: Accessible, unstyled component primitives
  - Accordion, Alert Dialog, Avatar, Badge, Button, Card, Checkbox, Dialog, Dropdown Menu, and more
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management
- **Tailwind Merge**: Utility for merging Tailwind classes

### Additional Libraries

- **React Router DOM**: Client-side routing and navigation
- **React Hook Form**: Form state management (ready for future use)
- **Sonner**: Toast notifications (ready for future use)
- **Next Themes**: Theme management (ready for dark mode)

### Testing

- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **@testing-library/user-event**: User interaction simulation

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **pnpm** (or npm/yarn)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "MealMind AI Web App"
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   - The app will automatically open at `http://localhost:3000`
   - Or manually navigate to the URL shown in the terminal

### Build for Production

```bash
npm run build
# or
pnpm build
```

The production build will be output to the `build/` directory.

### Linting & Code Quality

The project uses **ESLint** for code quality and **Husky** with **lint-staged** for pre-commit hooks.

#### Initial Setup

After installing dependencies, initialize Husky:

```bash
npm run prepare
# or
pnpm prepare
```

This sets up Git hooks that will run automatically before each commit.

#### Linting Commands

- **Check for linting errors:**

  ```bash
  npm run lint
  # or
  pnpm lint
  ```

- **Auto-fix linting errors:**
  ```bash
  npm run lint:fix
  # or
  pnpm lint:fix
  ```

### Testing Commands

- **Run tests:**

  ```bash
  npm run test
  # or
  pnpm test
  ```

- **Run tests with UI:**
  ```bash
  npm run test:ui
  # or
  pnpm test:ui
  ```

#### Pre-commit Hooks

Husky automatically runs lint-staged before each commit, which:

- Lints only staged files (`.ts` and `.tsx`)
- Auto-fixes fixable issues
- Prevents commits if there are linting errors

To bypass the pre-commit hook (not recommended):

```bash
git commit --no-verify
```

#### ESLint Configuration

The ESLint configuration (`.eslintrc.cjs`) includes:

- TypeScript ESLint rules
- React Hooks rules
- React Refresh plugin
- Custom rules for unused variables and console statements

---

## 🎨 Design System

### Color Palette

- **Primary**: `#2d7a3e` (Green) - Main brand color
- **Accent**: `#ff8b3d` (Orange) - Secondary actions and highlights
- **Background**: `#fdfcfb` (Off-white)
- **Card**: `#fff` (White)
- **Muted**: `#e8e8e0` (Light gray)

### Typography

- **Font Family**: System UI sans-serif stack
- **Font Sizes**: Responsive scale from `text-xs` to `text-6xl`
- **Font Weights**: Normal (400) and Medium (500)

### Spacing & Layout

- **Container**: Max-width containers for responsive layouts
- **Grid System**: CSS Grid for component layouts
- **Spacing Scale**: Consistent spacing using Tailwind's spacing scale

---

## 📱 Component Details

### Landing Component

- Hero section with gradient background
- "How It Works" section explaining the 4-step process
- Call-to-action buttons
- Responsive image display

### CuisineSelection Component

- Grid layout displaying 8 cuisine options
- Visual selection indicators
- Selection counter badge
- Navigation controls

### IngredientSelection Component

- Dynamic ingredient filtering based on selected cuisines
- Categorized ingredient display (Proteins, Vegetables, etc.)
- Checkbox selection interface
- Selection counter

### AILoading Component

- Animated loading screen with rotating icons
- Dynamic loading messages
- Progress bar animation
- AI branding badge

### RecipeOutput Component

- Recipe hero image and metadata
- Sticky ingredients sidebar
- Step-by-step instructions
- Chef's tips section
- Action buttons (Print, Share, Save)

---

## 🔄 User Flow

1. **Landing Page**

   - User arrives at the landing page
   - Clicks "Get Started" button

2. **Cuisine Selection**

   - User selects one or more cuisines
   - Clicks "Continue to Ingredients"

3. **Ingredient Selection**

   - System filters ingredients based on selected cuisines
   - User checks off available ingredients
   - Clicks "Generate Recipe"

4. **Loading State**

   - Animated loading screen appears
   - Dynamic loading messages cycle through
   - Recipe generation simulation (3 seconds)

5. **Recipe Display**
   - Generated recipe is displayed
   - User can view ingredients, instructions, and tips
   - User can print, share, or save recipe
   - User can create another recipe

---

## 🚀 Future Enhancements

### Potential Features

- **Real AI Integration**: Connect to actual AI API for recipe generation (service layer ready)
- **User Accounts**: Save favorite recipes and preferences
- **Recipe History**: Track previously generated recipes
- **Dietary Restrictions**: Filter by dietary preferences (vegan, gluten-free, etc.)
- **Recipe Ratings**: Allow users to rate and review recipes
- **Shopping List**: Generate shopping lists from recipes
- **Dark Mode**: Implement dark theme support (Next Themes already installed)
- **Recipe Sharing**: Social media sharing integration
- **Image Upload**: Allow users to upload ingredient photos
- **Recipe Scaling**: Adjust servings and automatically scale ingredients
- **Error Reporting**: Integrate error boundary with error reporting service
- **API Integration**: Use environment variables for API configuration

---

## 📝 Development Notes

### Recipe Generation Logic

The app uses a `RecipeService` class (`src/services/recipe-service.ts`) for recipe generation. This service:

- Selects a recipe template based on the primary cuisine
- Maps selected ingredients to recipe ingredient list
- Generates standard instructions and tips
- Returns a complete recipe object
- Includes error handling for validation

**Note**: To integrate with a real AI service, update the `RecipeService.generateRecipe()` method to make an API call to your AI service endpoint. The service is already structured as an async function for easy API integration.

### Image Handling

The app uses `ImageWithFallback` component to handle image loading errors gracefully. Images are loaded from Unsplash URLs, with fallback UI for failed loads.

### Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🤝 Contributing

This is a code bundle generated from a Figma design. To contribute:

1. Follow the existing code style and patterns
2. Maintain TypeScript type safety
3. Ensure responsive design compatibility
4. Test across different screen sizes
5. Follow accessibility best practices

---

## 📄 License

This project is private and proprietary.

---

## 🔗 Links

- **Original Design**: [Figma Design](https://www.figma.com/design/tWpnL8GrDnKDH3QwswjZbM/MealMind-AI-Web-App)
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Tailwind CSS Documentation**: https://tailwindcss.com/
- **Radix UI Documentation**: https://www.radix-ui.com/

---

## 📧 Support

For questions or issues, please refer to the project repository or contact the development team.

---

**Made with ❤️ for food lovers**
