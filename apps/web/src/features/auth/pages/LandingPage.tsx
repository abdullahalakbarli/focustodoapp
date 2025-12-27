import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/services/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { TimerDisplay } from "@/features/focus/components/TimerDisplay";
import { CategorySelector } from "@/features/focus/components/CategorySelector";
import { useTimer } from "@/shared/contexts/TimerContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Info, Target, BarChart3, Calendar, Trophy } from "lucide-react";
import { BottomNav } from "@/shared/components/layout/BottomNav";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { category, setCategory, duration, setDuration } = useTimer();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If user is authenticated, redirect to focus page
        navigate("/");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
          <h1 className="text-4xl font-bold text-foreground dark:text-white mb-2 tracking-tight">
            FocusMind
          </h1>
          <p className="text-muted-foreground text-sm font-medium mb-6">Stay focused, be productive</p>
          
          {/* CTA Buttons */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => navigate("/auth")} 
              className="rounded-full px-6"
              size="lg"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              variant="outline"
              className="rounded-full px-6"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Guest Mode Alert */}
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Try FocusMind Free</AlertTitle>
          <AlertDescription>
            You can use the timer below without signing in. Sign up to save your progress, earn points, and track your focus sessions!
          </AlertDescription>
        </Alert>

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

        {/* Features Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Why FocusMind?</h2>
          <div className="grid gap-4">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Focus Timer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pomodoro-style timer to help you stay focused and productive
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Track Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View detailed reports and analytics of your focus sessions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Task Planning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Plan and schedule your tasks with our intuitive planner
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Gamification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn points, unlock achievements, and compete on the leaderboard
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sign Up CTA */}
        <div className="text-center mb-8">
          <Button 
            onClick={() => navigate("/auth")} 
            className="rounded-full px-8"
            size="lg"
          >
            Start Your Focus Journey
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

