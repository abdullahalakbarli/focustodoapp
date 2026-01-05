import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Clock, Target, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  period: "daily" | "weekly" | "monthly";
  userId: string;
  extraMinutes?: number;
  currentCategoryHint?: string;
}

export const StatsCards = ({ period, userId, extraMinutes = 0, currentCategoryHint }: StatsCardsProps) => {
  const [stats, setStats] = useState({
    totalMinutes: 0,
    sessions: 0,
    topCategory: "N/A",
  });

  const fetchStats = useCallback(async () => {
    const now = new Date();
    let startDate = new Date();

    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    if (data) {
      // Calculate total by summing actual session durations (not session count × fixed duration)
      const totalMinutes = data.reduce((sum, session) => sum + session.duration_minutes, 0);
      const sessions = data.length;

      const categoryCounts = data.reduce((acc: any, session) => {
        acc[session.category] = (acc[session.category] || 0) + 1;
        return acc;
      }, {});

      const topCategory =
        Object.keys(categoryCounts).length > 0
          ? Object.entries(categoryCounts).sort((a: any, b: any) => b[1] - a[1])[0][0]
          : "N/A";

      setStats({
        totalMinutes,
        sessions,
        topCategory: topCategory.charAt(0).toUpperCase() + topCategory.slice(1),
      });
    }
  }, [period, userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const handleMinute = () => {
      fetchStats();
    };
    const handleComplete = () => {
      fetchStats();
    };
    window.addEventListener("timer:minute", handleMinute);
    window.addEventListener("timer:complete", handleComplete);
    return () => {
      window.removeEventListener("timer:minute", handleMinute);
      window.removeEventListener("timer:complete", handleComplete);
    };
  }, [fetchStats]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMinutes + extraMinutes} min</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.totalMinutes + extraMinutes) / 60)} hours
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sessions}</div>
          <p className="text-xs text-muted-foreground">Completed sessions</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.topCategory !== "N/A"
              ? stats.topCategory
              : (currentCategoryHint ? currentCategoryHint.charAt(0).toUpperCase() + currentCategoryHint.slice(1) : "N/A")}
          </div>
          <p className="text-xs text-muted-foreground">Most focused on</p>
        </CardContent>
      </Card>
    </div>
  );
};
