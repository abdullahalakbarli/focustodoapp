import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { CategorySelector } from "@/components/focus/CategorySelector";
import { CustomCategoryDialog } from "@/components/focus/CustomCategoryDialog";
import { useTimer } from "@/contexts/TimerContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import { AchievementsDialog } from "@/components/gamification/AchievementsDialog";

export default function Focus() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { category, setCategory, duration, setDuration, isActive } = useTimer();

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

        <PointsDisplay />

        <div className="flex justify-center mb-4">
          <AchievementsDialog />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CategorySelector
                selectedCategory={category}
                onSelectCategory={setCategory}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="duration" className="text-sm text-muted-foreground">Duration</Label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
                disabled={isActive}
              >
                <SelectTrigger id="duration" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TimerDisplay />

        <div className="mt-6">
          <CustomCategoryDialog onCategoryAdded={handleCategoryAdded} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
