import { useCallback, useRef } from "react";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/shared/contexts/TimerContext";
import { supabase } from "@/shared/services/supabase/client";
import { toast } from "@/shared/hooks/use-toast";
import type { Database } from "@/shared/services/supabase/types";
import FocusPage from "@/features/focus/pages/FocusPage";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import PlannerPage from "@/features/planner/pages/PlannerPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import EditProfilePage from "@/features/profile/pages/EditProfilePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import LandingPage from "@/features/auth/pages/LandingPage";
import LeaderboardPage from "@/features/leaderboard/pages/LeaderboardPage";
import NotFoundPage from "@/features/admin/pages/NotFoundPage";
import AdminAuthPage from "@/features/admin/pages/AdminAuthPage";
import AdminPanelPage from "@/features/admin/pages/AdminPanelPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import EmailVerificationPage from "@/features/auth/pages/EmailVerificationPage";
import { AdminProvider } from "@/shared/contexts/AdminContext";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { HomeRoute } from "@/shared/components/HomeRoute";

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
        // Normalize category to lowercase for consistency, but allow any custom category
        const normalizedCategory = category.toLowerCase().trim();
        // Ensure amount is a valid number and round to 2 decimal places
        const durationValue = Math.max(0, Math.round(amount * 100) / 100);
        
        if (durationValue <= 0) {
          console.warn("Attempted to save session with zero or negative duration:", amount);
          return;
        }

        const { error } = await supabase.from("focus_sessions").insert({
          user_id: session.user.id,
          category: normalizedCategory,
          duration_minutes: durationValue,
        });

        if (error) {
          console.error("Error saving focus segment:", error);
        } else if (process.env.NODE_ENV === 'development') {
          console.log(`Saved focus segment: ${durationValue} minutes for category "${normalizedCategory}"`);
        }
      } catch (error) {
        console.error("Error saving focus segment:", error);
      }
    },
    []
  );

  const handleSessionComplete = useCallback(async ({ durationMinutes, awardedIntervals }: { durationMinutes: number; awardedIntervals: number }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Guest mode - show friendly message
      const friendlyMinutes = Math.round(durationMinutes * 10) / 10;
      toast({
        title: "Session Complete! 🎉",
        description: `Great work! You completed a ${friendlyMinutes}-minute session. Sign in to save your progress and earn points!`,
      });
      return;
    }

    try {
      // Calculate and award points: 1 point per 10 minutes
      // Use the full durationMinutes to calculate points, ensuring no time is lost
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
                <Route path="/" element={<HomeRoute />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                <Route path="/auth" element={<ProtectedRoute requireAuth={false}><LoginPage /></ProtectedRoute>} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/email-verification" element={<EmailVerificationPage />} />
                <Route path="/admin-auth" element={<AdminAuthPage />} />
                <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </TimerProvider>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
