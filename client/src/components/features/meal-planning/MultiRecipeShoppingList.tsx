import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingListItem,
  groupShoppingListByCategory,
  exportShoppingListToText,
} from "@/utils/shopping";
import { Download, Printer, ArrowLeft, Loader2, FileText } from "lucide-react";
import { MealPlanService } from "@/services/meal-plan-service";
import { PDFService } from "@/services/pdf-service";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MultiRecipeShoppingListProps {
  weekStartDate: Date;
  onBack: () => void;
}

export function MultiRecipeShoppingList({
  weekStartDate,
  onBack,
}: MultiRecipeShoppingListProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [recipes, setRecipes] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [recipeMap, setRecipeMap] = useState<Map<string, string[]>>(new Map());
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    loadShoppingList();
  }, [weekStartDate]);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MealPlanService.getShoppingList(weekStartDate);

      if (!data || !data.shoppingList) {
        setError("No shopping list available for this meal plan");
        return;
      }

      // Convert backend format to ShoppingListItem format
      const items: ShoppingListItem[] = data.shoppingList.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        category: getCategory(item.name),
        checked: false,
      }));

      setShoppingList(items);
      setRecipes(data.recipes || []);

      // Create a map of ingredient name -> recipes that use it
      const map = new Map<string, string[]>();
      data.shoppingList.forEach((item) => {
        map.set(item.name.toLowerCase().trim(), item.recipes || []);
      });
      setRecipeMap(map);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shopping list"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategory = (ingredientName: string): string => {
    const lowerName = ingredientName.toLowerCase();
    const categoryMap: Record<string, string> = {
      // Proteins
      chicken: "Meat & Seafood",
      beef: "Meat & Seafood",
      pork: "Meat & Seafood",
      fish: "Meat & Seafood",
      salmon: "Meat & Seafood",
      shrimp: "Meat & Seafood",
      tofu: "Meat & Seafood",
      chickpeas: "Meat & Seafood",
      lentils: "Meat & Seafood",
      beans: "Meat & Seafood",
      // Produce
      tomato: "Produce",
      tomatoes: "Produce",
      onion: "Produce",
      onions: "Produce",
      garlic: "Produce",
      peppers: "Produce",
      lettuce: "Produce",
      spinach: "Produce",
      carrot: "Produce",
      carrots: "Produce",
      potato: "Produce",
      potatoes: "Produce",
      broccoli: "Produce",
      cauliflower: "Produce",
      zucchini: "Produce",
      mushroom: "Produce",
      mushrooms: "Produce",
      avocado: "Produce",
      lemon: "Produce",
      lime: "Produce",
      ginger: "Produce",
      cilantro: "Produce",
      parsley: "Produce",
      basil: "Produce",
      // Dairy
      milk: "Dairy & Eggs",
      cheese: "Dairy & Eggs",
      butter: "Dairy & Eggs",
      cream: "Dairy & Eggs",
      yogurt: "Dairy & Eggs",
      eggs: "Dairy & Eggs",
      // Pantry
      flour: "Pantry",
      rice: "Pantry",
      pasta: "Pantry",
      bread: "Pantry",
      quinoa: "Pantry",
      oats: "Pantry",
      oil: "Pantry",
      "olive oil": "Pantry",
      salt: "Pantry",
      pepper: "Pantry",
      sugar: "Pantry",
      vinegar: "Pantry",
      "soy sauce": "Pantry",
      "coconut milk": "Pantry",
      // Nuts & Seeds
      almonds: "Nuts & Seeds",
      peanuts: "Nuts & Seeds",
      walnuts: "Nuts & Seeds",
      cashews: "Nuts & Seeds",
      pecans: "Nuts & Seeds",
      sesame: "Nuts & Seeds",
      seeds: "Nuts & Seeds",
    };

    for (const [key, category] of Object.entries(categoryMap)) {
      if (lowerName.includes(key)) {
        return category;
      }
    }
    return "Other";
  };

  const toggleItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const grouped = groupShoppingListByCategory(shoppingList);
  const categories = Object.keys(grouped).sort();
  const checkedCount = shoppingList.filter((i) => i.checked).length;

  const handleExport = () => {
    const text = exportShoppingListToText(shoppingList);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const weekStr = weekStartDate.toISOString().split("T")[0];
    a.download = `meal-plan-shopping-list-${weekStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      await PDFService.exportMealPlanShoppingListPDF(weekStartDate);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF"
      );
    } finally {
      setExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRecipesForIngredient = (ingredientName: string): string[] => {
    return recipeMap.get(ingredientName.toLowerCase().trim()) || [];
  };

  if (loading) {
    return (
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Generating shopping list...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto p-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Meal Plan
                </Button>
                <Button onClick={loadShoppingList}>Try Again</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Weekly Shopping List</h1>
              <p className="text-muted-foreground mt-1">
                Week of{" "}
                {weekStartDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {recipes.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}{" "}
                  planned
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>

          {/* Shopping List Card */}
          <Card className="p-6 print:shadow-none">
            <div className="flex items-center justify-between mb-6 print:flex-col print:items-start print:gap-4">
              <h2 className="text-2xl font-semibold">Shopping List</h2>
              <div className="flex gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export TXT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {exportingPDF ? "Generating..." : "Export PDF"}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No items in shopping list
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <ul className="space-y-2">
                        {grouped[category].map((item) => {
                          const recipesForItem = getRecipesForIngredient(
                            item.name
                          );
                          return (
                            <li
                              key={item.id}
                              className="flex items-start gap-3 p-2 rounded hover:bg-muted print:hover:bg-transparent"
                            >
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => toggleItem(item.id)}
                                className="print:hidden mt-1"
                              />
                              <div className="flex-1">
                                <span
                                  className={`${
                                    item.checked
                                      ? "line-through text-muted-foreground"
                                      : ""
                                  }`}
                                >
                                  <span className="font-medium">
                                    {item.amount}
                                  </span>{" "}
                                  {item.name}
                                </span>
                                {recipesForItem.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1 print:hidden">
                                    Used in: {recipesForItem.join(", ")}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t print:hidden">
                  <p className="text-sm text-muted-foreground">
                    {checkedCount} of {shoppingList.length} items checked
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
