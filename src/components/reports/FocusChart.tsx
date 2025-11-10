import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useEffect, useState } from "react";

interface FocusChartProps {
  period: "daily" | "weekly" | "monthly";
  userId: string;
}

export const FocusChart = ({ period, userId }: FocusChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [foreground, setForeground] = useState("#111111");
  const [muted, setMuted] = useState("#888888");

  useEffect(() => {
    const updateColors = () => {
      const styles = getComputedStyle(document.documentElement);
      setForeground(styles.getPropertyValue("--foreground").trim() || "#111111");
      setMuted(styles.getPropertyValue("--muted-foreground").trim() || "#6b7280");
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fetchChartData = useCallback(async () => {
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
      .select(`
        *,
        tasks (
          color
        )
      `)
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    if (data) {
      const grouped = data.reduce((acc: any, session) => {
        const category = session.category;
        const taskColor = session.tasks?.[0]?.color || "#3b82f6";
        if (!acc[category]) {
          acc[category] = { 
            name: category.charAt(0).toUpperCase() + category.slice(1), 
            minutes: 0,
            color: taskColor
          };
        }
        acc[category].minutes += session.duration_minutes;
        return acc;
      }, {});

      setChartData(Object.values(grouped));
    }
  }, [period, userId]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    const handleMinute = () => fetchChartData();
    const handleComplete = () => fetchChartData();
    window.addEventListener("timer:minute", handleMinute);
    window.addEventListener("timer:complete", handleComplete);
    return () => {
      window.removeEventListener("timer:minute", handleMinute);
      window.removeEventListener("timer:complete", handleComplete);
    };
  }, [fetchChartData]);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Focus Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={muted} />
            <XAxis dataKey="name" tick={{ fill: foreground }} className="text-xs" />
            <YAxis tick={{ fill: foreground }} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: foreground }}
              itemStyle={{ color: foreground }}
            />
            <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
