import { useState, useEffect } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/shared/components/layout/BottomNav";
import { TimerDisplay } from "../components/TimerDisplay";
import { CategorySelector } from "../components/CategorySelector";
import { CustomCategoryDialog } from "../components/CustomCategoryDialog";
import { useTimer } from "@/shared/contexts/TimerContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { PointsDisplay } from "@/shared/components/gamification/PointsDisplay";
import { AchievementsDialog } from "@/shared/components/gamification/AchievementsDialog";

export default function Focus() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { category, setCategory, duration, setDuration, isActive } = useTimer();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist current category to localStorage for session completion
  useEffect(() => {
    localStorage.setItem("currentTimerCategory", category.toLowerCase());
  }, [category]);

  const handleCategoryAdded = (newCategory: string) => {
    // Dispatch custom event to refresh CategorySelector
    window.dispatchEvent(new Event("customCategoryAdded"));
    setCategory(newCategory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/8 via-background via-50% to-accent/8 pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      
      <div className="container max-w-md mx-auto px-4 pt-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary shadow-soft-md flex items-center justify-center animate-pulse-glow">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <h1
            className="text-4xl font-bold text-foreground dark:text-white mb-2 tracking-tight select-none cursor-pointer"
            role="button"
            aria-label="Open admin access"
            draggable={false}
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              e.preventDefault();
              const target = e.currentTarget as HTMLElement & { __lpTimer?: any };
              target.__lpTimer = setTimeout(() => {
                window.location.href = "/admin-auth";
              }, 1200);
            }}
            onPointerUp={(e) => {
              const target = e.currentTarget as any;
              if (target.__lpTimer) {
                clearTimeout(target.__lpTimer);
                target.__lpTimer = null;
              }
            }}
            onPointerLeave={(e) => {
              const target = e.currentTarget as any;
              if (target.__lpTimer) {
                clearTimeout(target.__lpTimer);
                target.__lpTimer = null;
              }
            }}
          >
            FocusMind
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Stay focused, be productive</p>
        </div>

        {/* Guest Mode Alert */}
        {!user && (
          <div className="mb-6 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
            <p className="text-sm text-center text-muted-foreground">
              💡 <strong>Guest Mode:</strong> Timer works but sessions won't be saved.{" "}
              <button 
                onClick={() => navigate("/auth")} 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>{" "}
              to save your progress!
            </p>
          </div>
        )}

        {/* Points Display - Only show for authenticated users */}
        {user && (
          <div className="mb-6">
            <PointsDisplay />
          </div>
        )}

        {/* Achievements - Only show for authenticated users */}
        {user && (
          <div className="flex justify-center mb-6">
            <AchievementsDialog />
          </div>
        )}

        {/* Timer Display */}
        <TimerDisplay />

        {/* Category & Duration Selection */}
        <div className="space-y-4 mb-6 mt-8">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <CategorySelector
                selectedCategory={category}
                onSelectCategory={setCategory}
              />
            </div>
            <div className="w-full">
              <Label htmlFor="duration" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Duration
              </Label>
              <Select
                value={duration.toString()}
                onValueChange={(value) => setDuration(parseInt(value))}
                disabled={isActive}
              >
                <SelectTrigger id="duration" className="h-12 rounded-xl border-2 glass shadow-soft hover-lift transition-smooth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="15" className="rounded-lg">15 min</SelectItem>
                  <SelectItem value="25" className="rounded-lg">25 min</SelectItem>
                  <SelectItem value="45" className="rounded-lg">45 min</SelectItem>
                  <SelectItem value="60" className="rounded-lg">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Custom Category */}
        <div className="mt-8 mb-6">
          <CustomCategoryDialog onCategoryAdded={handleCategoryAdded} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
