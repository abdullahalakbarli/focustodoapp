import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { toast } from "@/shared/hooks/use-toast";

export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  is_deleted: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const DEFAULT_CATEGORIES = [
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

/**
 * Hook for managing user categories from the database
 * Replaces localStorage-based category storage
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customCategories, setCustomCategories] = useState<UserCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    if (!userId) {
      setCategories(DEFAULT_CATEGORIES);
      setCustomCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_categories")
        .select("*")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const categoryNames = (data || []).map((cat) => cat.name);
      setCustomCategories(data || []);
      setCategories([...DEFAULT_CATEGORIES, ...categoryNames]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Using default categories.",
        variant: "destructive",
      });
      setCategories(DEFAULT_CATEGORIES);
      setCustomCategories([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load categories when user changes
  useEffect(() => {
    if (userId) {
      fetchCategories();
    } else {
      setCategories(DEFAULT_CATEGORIES);
      setCustomCategories([]);
      setLoading(false);
    }
  }, [userId, fetchCategories]);

  // Migrate localStorage categories to database (one-time migration)
  const migrateLocalStorageCategories = useCallback(async () => {
    if (!userId) return;

    try {
      const storedCategories = JSON.parse(
        localStorage.getItem("customCategories") || "[]"
      ) as string[];

      if (storedCategories.length === 0) return;

      // Check which categories already exist in database
      const { data: existingCategories } = await supabase
        .from("user_categories")
        .select("name")
        .eq("user_id", userId)
        .eq("is_deleted", false);

      const existingNames = new Set(
        (existingCategories || []).map((cat) => cat.name.toLowerCase())
      );

      // Insert only new categories
      const categoriesToInsert = storedCategories
        .filter((name) => {
          const normalized = name.trim();
          return normalized && !existingNames.has(normalized.toLowerCase());
        })
        .map((name) => ({
          user_id: userId,
          name: name.trim(),
          is_deleted: false,
        }));

      if (categoriesToInsert.length > 0) {
        const { error } = await supabase
          .from("user_categories")
          .insert(categoriesToInsert);

        if (error) throw error;

        // Clear localStorage after successful migration
        localStorage.removeItem("customCategories");

        toast({
          title: "Categories Migrated",
          description: `${categoriesToInsert.length} category(ies) migrated from browser storage.`,
        });

        // Refresh categories
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error migrating categories:", error);
      // Don't show error toast for migration failures - it's not critical
    }
  }, [userId, fetchCategories]);

  // Run migration once when user logs in
  useEffect(() => {
    if (userId) {
      migrateLocalStorageCategories();
    }
  }, [userId, migrateLocalStorageCategories]);

  // Add a new category
  const addCategory = useCallback(
    async (name: string): Promise<boolean> => {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to add categories",
          variant: "destructive",
        });
        return false;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        toast({
          title: "Error",
          description: "Category name cannot be empty",
          variant: "destructive",
        });
        return false;
      }

      // Check if category already exists (case-insensitive)
      const normalizedName = trimmedName.toLowerCase();
      const exists = categories.some(
        (cat) => cat.toLowerCase() === normalizedName
      );

      if (exists) {
        toast({
          title: "Error",
          description: "This category already exists",
          variant: "destructive",
        });
        return false;
      }

      try {
        const { data, error } = await supabase
          .from("user_categories")
          .insert({
            user_id: userId,
            name: trimmedName,
            is_deleted: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setCustomCategories((prev) => [...prev, data]);
        setCategories((prev) => [...prev, trimmedName]);

        // Dispatch event for other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("customCategoryAdded"));
        }

        toast({
          title: "Success",
          description: "Category added successfully",
        });

        return true;
      } catch (error: any) {
        console.error("Error adding category:", error);
        
        // Handle unique constraint violation
        if (error.code === "23505") {
          toast({
            title: "Error",
            description: "This category already exists",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to add category",
            variant: "destructive",
          });
        }
        return false;
      }
    },
    [userId, categories]
  );

  // Delete a category (soft delete)
  const deleteCategory = useCallback(
    async (name: string): Promise<boolean> => {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to delete categories",
          variant: "destructive",
        });
        return false;
      }

      // Find the category in custom categories
      const category = customCategories.find(
        (cat) => cat.name.toLowerCase() === name.toLowerCase()
      );

      if (!category) {
        toast({
          title: "Error",
          description: "Category not found",
          variant: "destructive",
        });
        return false;
      }

      try {
        const { error } = await supabase
          .from("user_categories")
          .update({ is_deleted: true })
          .eq("id", category.id)
          .eq("user_id", userId);

        if (error) throw error;

        // Update local state
        setCustomCategories((prev) =>
          prev.filter((cat) => cat.id !== category.id)
        );
        setCategories((prev) =>
          prev.filter((cat) => cat.toLowerCase() !== name.toLowerCase())
        );

        // Dispatch event for other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("customCategoryDeleted"));
        }

        toast({
          title: "Category Deleted",
          description: `"${name}" has been removed.`,
        });

        return true;
      } catch (error: any) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete category",
          variant: "destructive",
        });
        return false;
      }
    },
    [userId, customCategories]
  );

  // Check if a category is custom (not a default category)
  const isCustomCategory = useCallback(
    (categoryName: string): boolean => {
      return !DEFAULT_CATEGORIES.some(
        (defaultCat) => defaultCat.toLowerCase() === categoryName.toLowerCase()
      );
    },
    []
  );

  return {
    categories,
    customCategories,
    loading,
    addCategory,
    deleteCategory,
    isCustomCategory,
    refreshCategories: fetchCategories,
  };
};

