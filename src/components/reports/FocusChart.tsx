import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FocusChartProps {
  period: "daily" | "weekly" | "monthly";
  userId: string;
}

export const FocusChart = ({ period, userId }: FocusChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchChartData();
  }, [period, userId]);

  const fetchChartData = async () => {
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
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Focus Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <rect key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
