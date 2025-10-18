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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const handleSessionComplete = async (durationMinutes: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Get current category from localStorage
      const currentCategory = localStorage.getItem("currentTimerCategory") || "study";
      
      const { error } = await supabase.from("focus_sessions").insert({
        user_id: session.user.id,
        category: currentCategory as Database["public"]["Enums"]["task_category"],
        duration_minutes: durationMinutes,
      });

      if (error) throw error;

      toast({
        title: "Session Complete!",
        description: `Great work! You completed a ${durationMinutes}-minute session.`,
      });
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TimerProvider onComplete={handleSessionComplete}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Focus />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TimerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
