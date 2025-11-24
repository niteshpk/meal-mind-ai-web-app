import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DietaryRestriction } from "@/types/dietary";

const DIETARY_OPTIONS: { value: DietaryRestriction; label: string; icon: string }[] = [
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "gluten-free", label: "Gluten-Free", icon: "🌾" },
  { value: "keto", label: "Keto", icon: "🥑" },
  { value: "paleo", label: "Paleo", icon: "🥩" },
  { value: "dairy-free", label: "Dairy-Free", icon: "🥛" },
  { value: "nut-free", label: "Nut-Free", icon: "🥜" },
  { value: "low-carb", label: "Low-Carb", icon: "🍞" },
];

interface DietaryFiltersProps {
  restrictions: DietaryRestriction[];
  onChange: (restrictions: DietaryRestriction[]) => void;
}

export function DietaryFilters({ restrictions, onChange }: DietaryFiltersProps) {
  const toggleRestriction = (restriction: DietaryRestriction) => {
    if (restrictions.includes(restriction)) {
      onChange(restrictions.filter((r) => r !== restriction));
    } else {
      onChange([...restrictions, restriction]);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Dietary Preferences</h3>
      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((option) => (
          <Badge
            key={option.value}
            variant={restrictions.includes(option.value) ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/80 transition-colors"
            onClick={() => toggleRestriction(option.value)}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

