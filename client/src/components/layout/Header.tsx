import React from "react";
import { ChefHat } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl text-primary">MealMind AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Your AI Recipe Generator
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#"
              className="text-sm hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#"
              className="text-sm hover:text-primary transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
