import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { APIService } from "@/services/api-service";
import { Cuisine } from "@/types";

interface CuisineSelectionProps {
  selectedCuisines: string[];
  onToggleCuisine: (cuisineId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onMount?: () => void;
}

export function CuisineSelection({
  selectedCuisines,
  onToggleCuisine,
  onNext,
  onBack,
  onMount,
}: CuisineSelectionProps) {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onMount?.();
  }, [onMount]);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await APIService.getCuisines();
        setCuisines(data);
      } catch (err) {
        setError("Failed to load cuisines. Please try again.");
        console.error("Error fetching cuisines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCuisines();
  }, []);

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge className="mb-4 bg-primary-lighter text-primary">
            Step 1 of 3
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Choose Your Cuisine
          </h1>
          <p className="text-lg text-muted-foreground">
            Select one or multiple cuisines to explore. We'll show you relevant
            ingredients next.
          </p>
        </div>

        {/* Selected Counter */}
        {selectedCuisines.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6 flex items-center justify-center gap-2">
            <div className="bg-primary-lighter border-primary-light border px-4 py-2 rounded-full">
              <span className="text-sm text-primary">
                {selectedCuisines.length}{" "}
                {selectedCuisines.length === 1 ? "cuisine" : "cuisines"}{" "}
                selected
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading cuisines...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mb-12 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Cuisine Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {cuisines.map((cuisine) => {
              const isSelected = selectedCuisines.includes(cuisine.id);

              return (
                <Card
                  key={cuisine.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    isSelected
                      ? "ring-2 ring-primary border-primary shadow-lg"
                      : ""
                  }`}
                  onClick={() => onToggleCuisine(cuisine.id)}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={cuisine.image}
                      alt={cuisine.name}
                      className="w-full h-48 object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-primary rounded-full p-2">
                        <Check className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2">{cuisine.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cuisine.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" size="lg" onClick={onBack}>
            Back to Home
          </Button>
          <Button
            size="lg"
            disabled={selectedCuisines.length === 0 || loading}
            onClick={onNext}
            className="bg-primary hover:bg-primary-light"
          >
            Continue to Ingredients
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
