import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const defaultCategories = [
  "Study",
  "Work",
  "Coding",
  "Reading",
  "Exercise",
  "Meditation",
  "Design",
  "Writing",
  "Meeting",
  "Other",
];

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySelector = ({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) => {
  const [allCategories, setAllCategories] = useState<string[]>(defaultCategories);

  useEffect(() => {
    const customCategories = JSON.parse(
      localStorage.getItem("customCategories") || "[]"
    );
    setAllCategories([...defaultCategories, ...customCategories]);
  }, []);

  const refreshCategories = () => {
    const customCategories = JSON.parse(
      localStorage.getItem("customCategories") || "[]"
    );
    setAllCategories([...defaultCategories, ...customCategories]);
  };

  // Add event listener for custom category updates
  useEffect(() => {
    const handleStorageChange = () => {
      refreshCategories();
    };

    window.addEventListener("customCategoryAdded", handleStorageChange);
    return () => {
      window.removeEventListener("customCategoryAdded", handleStorageChange);
    };
  }, []);
  return (
    <Card className="shadow-soft-md glass border-primary/10 animate-scale-in">
      <CardContent className="pt-6">
        <p className="text-sm font-semibold mb-4 text-foreground/80">Select Category</p>
        <div className="grid grid-cols-2 gap-2.5">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "px-4 py-3.5 rounded-xl text-sm font-medium transition-smooth active-press hover-lift",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-soft-md hover-glow scale-105"
                  : "bg-accent/50 hover:bg-accent text-accent-foreground border border-border/50"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
