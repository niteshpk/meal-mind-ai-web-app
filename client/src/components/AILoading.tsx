import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Sparkles, ChefHat, CookingPot } from "lucide-react";

export function AILoading() {
  const [loadingText, setLoadingText] = useState(
    "Analyzing your ingredients..."
  );

  useEffect(() => {
    const loadingSteps = [
      "Analyzing your ingredients...",
      "Searching through thousands of recipes...",
      "Matching flavors and techniques...",
      "Creating your perfect recipe...",
      "Almost ready!",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % loadingSteps.length;
      setLoadingText(loadingSteps[currentStep]);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[600px] flex items-center justify-center py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto p-12 text-center">
          {/* Animated Icons */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary rounded-full p-6 animate-pulse">
                <ChefHat className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>

            {/* Orbiting Icons */}
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: "3s" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-accent rounded-full p-3">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: "3s", animationDelay: "1s" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="bg-primary-light rounded-full p-3">
                  <CookingPot className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl md:text-3xl mb-4">Generating Your Recipe</h2>

          <p className="text-lg text-muted-foreground mb-8 min-h-[28px] transition-all duration-300">
            {loadingText}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
          </div>

          {/* AI Badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-primary-lighter px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Powered by AI</span>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
