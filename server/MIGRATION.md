# Database Migration Guide

## Overview

This guide explains how to migrate from hardcoded constants to MongoDB database.

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB locally, or
   - Set up MongoDB Atlas (cloud) account

2. **Get MongoDB Connection String**
   - Local: `mongodb://localhost:27017/mealmind`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/mealmind`

## Setup Steps

### 1. Configure MongoDB Connection

Edit `server/.env` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/mealmind
# Or for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mealmind
```

### 2. Run Migration Script

The migration script will:
- Connect to MongoDB
- Clear existing data (optional)
- Seed all hardcoded data into database

```bash
cd server
pnpm seed
```

### 3. Verify Data

Check that data was seeded correctly:

```bash
# Using MongoDB shell
mongosh mealmind
> db.cuisines.countDocuments()
> db.ingredients.countDocuments()
> db.recipes.countDocuments()
```

Or use MongoDB Compass to visually inspect the data.

## Database Collections

### Collections Created

1. **cuisines** - All available cuisines
2. **ingredients** - All available ingredients
3. **cuisineingredients** - Mapping of cuisines to ingredients
4. **recipetemplates** - Recipe templates for each cuisine
5. **ingredientmaps** - Default ingredient amounts
6. **defaultinstructions** - Default cooking instructions
7. **defaulttips** - Default cooking tips
8. **cuisinenames** - Cuisine name mappings
9. **recipes** - Generated recipes (populated as users generate recipes)

## Re-running Migration

To re-seed the database (clears existing data):

```bash
pnpm seed
```

**Warning**: This will delete all existing data including generated recipes!

## Data Structure

### Cuisine Document
```json
{
  "id": "italian",
  "name": "Italian",
  "description": "Pasta, pizza, and Mediterranean flavors",
  "image": "https://...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Ingredient Document
```json
{
  "id": "tomato",
  "name": "Tomato",
  "category": "Vegetables",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Recipe Document
```json
{
  "name": "Italian Pasta",
  "description": "...",
  "cuisine": "Italian",
  "prepTime": "15",
  "cookTime": "20",
  "servings": 4,
  "difficulty": "Medium",
  "ingredients": [
    { "amount": "2 cups", "item": "pasta" }
  ],
  "instructions": ["Step 1", "Step 2"],
  "tips": ["Tip 1", "Tip 2"],
  "cuisines": ["italian"],
  "ingredientIds": ["pasta", "tomato"],
  "generatedBy": "ai",
  "aiModel": "gpt-4o-mini",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongosh --eval "db.version()"`
- Check connection string format
- Ensure network access if using Atlas

### Migration Fails
- Check MongoDB logs
- Verify all environment variables are set
- Ensure database permissions

### Data Not Appearing
- Check collection names (MongoDB uses lowercase plural)
- Verify seed script completed successfully
- Check for duplicate key errors

