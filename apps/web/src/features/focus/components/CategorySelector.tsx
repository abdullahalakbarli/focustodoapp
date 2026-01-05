import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useCategories } from "@/shared/hooks/useCategories";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySelector = ({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) => {
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { categories, deleteCategory, isCustomCategory, loading } = useCategories();

  // Listen for category updates from other components
  useEffect(() => {
    const handleCategoryUpdate = () => {
      // Categories are automatically updated via the hook
      // This event can be used to trigger re-renders if needed
    };

    window.addEventListener("customCategoryAdded", handleCategoryUpdate);
    window.addEventListener("customCategoryDeleted", handleCategoryUpdate);
    return () => {
      window.removeEventListener("customCategoryAdded", handleCategoryUpdate);
      window.removeEventListener("customCategoryDeleted", handleCategoryUpdate);
    };
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    if (isCustomCategory(category)) {
      setCategoryToDelete(category);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    const success = await deleteCategory(categoryToDelete);

    if (success) {
      // If the deleted category was selected, switch to "Other"
      if (selectedCategory === categoryToDelete) {
        onSelectCategory("Other");
      }

      setCategoryToDelete(null);
      // Dispatch event for other components
      window.dispatchEvent(new Event("customCategoryDeleted"));
    }
  };

  return (
    <>
      <Card className="shadow-soft-md glass border-primary/10 animate-scale-in">
        <CardContent className="pt-6">
          <p className="text-sm font-semibold mb-4 text-foreground/80">Select Category</p>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading categories...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((category) => {
                const isCustom = isCustomCategory(category);
                return (
                  <div
                    key={category}
                    className="relative group"
                  >
                    <button
                      onClick={() => onSelectCategory(category)}
                      className={cn(
                        "w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-smooth active-press hover-lift",
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground shadow-soft-md hover-glow scale-105"
                          : "bg-accent/50 hover:bg-accent text-accent-foreground border border-border/50"
                      )}
                    >
                      {category}
                    </button>
                    {isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={categoryToDelete !== null} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete}"? This action cannot be undone.
              Note: This will not delete any existing focus sessions associated with this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
