import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ChefHat, Sparkles, Search, CookingPot } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-lighter to-accent-lighter py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm">AI-Powered Recipe Generation</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl">
                Create Delicious <span className="text-primary">Recipes</span>{" "}
                from Your <span className="text-accent">Ingredients</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Choose your favorite cuisines, select available ingredients, and
                let our AI craft the perfect recipe just for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-light text-lg px-8"
                  onClick={onGetStarted}
                >
                  <ChefHat className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1665088127661-83aeff6104c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNvb2tpbmclMjBpbmdyZWRpZW50cyUyMHZlZ2V0YWJsZXN8ZW58MXx8fHwxNzYzODg1Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Fresh cooking ingredients"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-full p-4 shadow-lg hidden md:block">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hidden md:block">
                <CookingPot className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to discover your next favorite recipe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Choose Cuisines",
                description:
                  "Select one or multiple cuisines that you're in the mood for",
                icon: Search,
                color: "primary",
              },
              {
                step: "02",
                title: "View Ingredients",
                description:
                  "See a list of common ingredients for your selected cuisines",
                icon: CookingPot,
                color: "accent",
              },
              {
                step: "03",
                title: "Select What You Have",
                description:
                  "Pick the ingredients you already have in your kitchen",
                icon: ChefHat,
                color: "primary",
              },
              {
                step: "04",
                title: "Get Your Recipe",
                description:
                  "AI generates a personalized recipe based on your selections",
                icon: Sparkles,
                color: "accent",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`flex justify-between items-center px-3 py-2 rounded-xl ${
                      item.color === "primary"
                        ? "bg-primary-lighter"
                        : "bg-accent-lighter"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        item.color === "primary"
                          ? "text-primary"
                          : "text-accent"
                      }`}
                    />
                    <div
                      className={`text-sm ${
                        item.color === "primary"
                          ? "text-primary"
                          : "text-accent"
                      }`}
                    >
                      Step {item.step}
                    </div>
                  </div>
                  <h3 className="mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">
            Ready to Cook Something Amazing?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of home cooks discovering new recipes every day
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={onGetStarted}
          >
            Start Creating Recipes
          </Button>
        </div>
      </section>
    </div>
  );
}
