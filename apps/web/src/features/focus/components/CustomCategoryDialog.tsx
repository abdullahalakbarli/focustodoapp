import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Plus } from "lucide-react";
import { useCategories } from "@/shared/hooks/useCategories";

interface CustomCategoryDialogProps {
  onCategoryAdded: (category: string) => void;
}

export const CustomCategoryDialog = ({ onCategoryAdded }: CustomCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addCategory } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      return;
    }

    setLoading(true);
    const success = await addCategory(categoryName.trim());
    
    if (success) {
      onCategoryAdded(categoryName.trim());
      setCategoryName("");
      setOpen(false);
    }
    
    setLoading(false);
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
