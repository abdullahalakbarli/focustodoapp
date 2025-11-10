import { useCallback, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/contexts/TimerContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import Focus from "./pages/Focus";
import Reports from "./pages/Reports";
import Planner from "./pages/Planner";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Auth from "./pages/Auth";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/AdminAuth";
import AdminPanel from "./pages/AdminPanel";
import { AdminProvider } from "./contexts/AdminContext";

const queryClient = new QueryClient();

const App = () => {
  const pointsCacheRef = useRef<number | null>(null);

  const getCurrentPoints = useCallback(async (userId: string) => {
    if (pointsCacheRef.current !== null) {
      return pointsCacheRef.current;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const currentPoints = data?.points || 0;
    pointsCacheRef.current = currentPoints;
    return currentPoints;
  }, []);

  const updatePointsTotal = useCallback(
    async (userId: string, deltaPoints: number) => {
      if (deltaPoints <= 0) {
        return null;
      }

      const currentPoints = await getCurrentPoints(userId);
      const newPoints = currentPoints + deltaPoints;

      const { error } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", userId);

      if (error) throw error;

      pointsCacheRef.current = newPoints;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("points:updated", { detail: newPoints }));
      }

      return newPoints;
    },
    [getCurrentPoints]
  );

  const handleSessionProgress = useCallback(
    async (intervalIncrements: number) => {
      if (intervalIncrements <= 0) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const earnedPoints = intervalIncrements; // 1 point per 10 minutes
        const newPoints = await updatePointsTotal(session.user.id, earnedPoints);

        if (newPoints !== null) {
          toast({
            title: "Focus streak 🌟",
            description: `+${earnedPoints} point${earnedPoints > 1 ? "s" : ""} added. Total: ${newPoints}`,
          });
        }
      } catch (error) {
        console.error("Error updating points mid-session:", error);
      }
    },
    [updatePointsTotal, toast]
  );

  const handleSegmentComplete = useCallback(
    async ({ category, minutes }: { category: string; minutes: number }) => {
      const amount = parseFloat(minutes.toFixed(2));
      if (amount <= 0) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      try {
        await supabase.from("focus_sessions").insert({
          user_id: session.user.id,
          category: category.toLowerCase() as Database["public"]["Enums"]["task_category"],
          duration_minutes: amount,
        });
      } catch (error) {
        console.error("Error saving focus segment:", error);
      }
    },
    []
  );

  const handleSessionComplete = useCallback(async ({ durationMinutes, awardedIntervals }: { durationMinutes: number; awardedIntervals: number }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Calculate and award points: 1 point per 10 minutes
      const totalSessionPoints = Math.floor(durationMinutes / 10);
      const remainingPoints = Math.max(totalSessionPoints - awardedIntervals, 0);
      const friendlyMinutes = Math.round(durationMinutes * 10) / 10;

      let latestPointsTotal = await getCurrentPoints(session.user.id);

      if (remainingPoints > 0) {
        const updatedTotal = await updatePointsTotal(session.user.id, remainingPoints);
        if (updatedTotal !== null) {
          latestPointsTotal = updatedTotal;
        }
      } else {
        // ensure cache is aligned with database
        latestPointsTotal = await getCurrentPoints(session.user.id);
      }

      if (totalSessionPoints > 0) {
        toast({
          title: "Session Complete! 🎉",
          description: `You earned ${totalSessionPoints} point${totalSessionPoints > 1 ? "s" : ""} this session over ${friendlyMinutes} minutes. Total: ${latestPointsTotal}`,
        });
      } else {
        toast({
          title: "Session Complete!",
          description: `Great work! You completed a ${friendlyMinutes}-minute session.`,
        });
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    }
  }, [getCurrentPoints, updatePointsTotal, toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminProvider>
          <TimerProvider
            onComplete={handleSessionComplete}
            onProgress={handleSessionProgress}
            onSegment={handleSegmentComplete}
          >
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Focus />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TimerProvider>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
