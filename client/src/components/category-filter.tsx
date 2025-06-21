import { Button } from "@/components/ui/button";
import { FOOD_CATEGORIES } from "@/lib/constants";
import * as Icons from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'utensils': Icons.Utensils,
      'pizza-slice': Icons.Pizza,
      'hamburger': Icons.Beef,
      'fish': Icons.Fish,
      'ice-cream': Icons.IceCream,
      'leaf': Icons.Leaf,
      'pepper-hot': Icons.Flame,
      'drumstick-bite': Icons.Drumstick,
    };
    return iconMap[iconName] || Icons.Utensils;
  };

  return (
    <section className="bg-white border-b sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6 overflow-x-auto py-4 scrollbar-hide">
          {FOOD_CATEGORIES.map((category) => {
            const IconComponent = getIcon(category.icon);
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => onCategoryChange(category.id)}
                className={`flex-shrink-0 flex flex-col items-center space-y-2 h-auto py-2 px-4 ${
                  isSelected 
                    ? "text-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isSelected 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 hover:bg-primary hover:text-white"
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
