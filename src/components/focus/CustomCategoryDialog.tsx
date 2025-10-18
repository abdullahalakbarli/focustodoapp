import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CustomCategoryDialogProps {
  onCategoryAdded: (category: string) => void;
}

export const CustomCategoryDialog = ({ onCategoryAdded }: CustomCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    // Get existing custom categories
    const existingCategories = JSON.parse(
      localStorage.getItem("customCategories") || "[]"
    );

    // Check if category already exists
    if (existingCategories.includes(categoryName.trim())) {
      toast({
        title: "Error",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }

    // Add new category
    const updatedCategories = [...existingCategories, categoryName.trim()];
    localStorage.setItem("customCategories", JSON.stringify(updatedCategories));

    onCategoryAdded(categoryName.trim());
    
    toast({
      title: "Success",
      description: "Custom category added successfully",
    });

    setCategoryName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Research, Music Practice"
              maxLength={20}
            />
          </div>
          <Button type="submit" className="w-full">
            Add Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
