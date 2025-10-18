import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { CategorySelector } from "@/components/focus/CategorySelector";
import { CustomCategoryDialog } from "@/components/focus/CustomCategoryDialog";
import { useTimer } from "@/contexts/TimerContext";

export default function Focus() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { category, setCategory } = useTimer();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Persist current category to localStorage for session completion
  useEffect(() => {
    localStorage.setItem("currentTimerCategory", category.toLowerCase());
  }, [category]);

  const handleCategoryAdded = (newCategory: string) => {
    // Dispatch custom event to refresh CategorySelector
    window.dispatchEvent(new Event("customCategoryAdded"));
    setCategory(newCategory);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container max-w-md mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            FocusMind
          </h1>
          <p className="text-muted-foreground">Stay focused, be productive</p>
        </div>

        <CategorySelector
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

        <TimerDisplay />

        <div className="mt-6">
          <CustomCategoryDialog onCategoryAdded={handleCategoryAdded} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
