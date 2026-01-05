import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CategoryData {
  name: string;
  minutes: number;
  hours: number;
  percentage: number;
  color: string;
  formattedTime: string;
}

interface WeeklyFocusDistributionProps {
  userId: string;
}

// Modern color palette - ensures good contrast and accessibility
const COLOR_PALETTE = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow/amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
  "#a855f7", // violet
];

// Get start and end of week (Monday to Sunday)
const getWeekBounds = (date: Date): { start: Date; end: Date } => {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate Monday of the week (day 1 = Monday, day 0 = Sunday)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Format date range for display
const formatWeekRange = (start: Date, end: Date): string => {
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} - ${endStr}`;
};

// Format time for display
const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.formattedTime} ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">
          {data.formattedTime} ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export const WeeklyFocusDistribution = ({ userId }: WeeklyFocusDistributionProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"pie" | "bar">("pie");
  const [foreground, setForeground] = useState("#111111");
  const [muted, setMuted] = useState("#888888");

  // Update colors based on theme
  useEffect(() => {
    const updateColors = () => {
      const styles = getComputedStyle(document.documentElement);
      setForeground(styles.getPropertyValue("--foreground").trim() || "#111111");
      setMuted(styles.getPropertyValue("--muted-foreground").trim() || "#888888");
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fetchWeekData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getWeekBounds(currentWeek);

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error) {
      console.error("Error fetching focus data:", error);
      setLoading(false);
      return;
    }

    if (data) {
      // Group by category and sum durations
      const grouped = data.reduce((acc: Record<string, number>, session) => {
        const category = session.category.toLowerCase().trim();
        acc[category] = (acc[category] || 0) + session.duration_minutes;
        return acc;
      }, {});

      // Calculate total
      const total = Object.values(grouped).reduce((sum, minutes) => sum + minutes, 0);
      setTotalMinutes(total);

      // Transform to chart data with percentages
      const chartDataArray: CategoryData[] = Object.entries(grouped)
        .map(([category, minutes], index) => {
          const name = category.charAt(0).toUpperCase() + category.slice(1);
          const hours = minutes / 60;
          const percentage = total > 0 ? (minutes / total) * 100 : 0;
          const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
          const formattedTime = formatTime(minutes);

          return {
            name,
            minutes,
            hours,
            percentage,
            color,
            formattedTime,
          };
        })
        .sort((a, b) => b.minutes - a.minutes); // Sort by minutes descending

      setChartData(chartDataArray);
    }

    setLoading(false);
  }, [currentWeek, userId]);

  useEffect(() => {
    fetchWeekData();
  }, [fetchWeekData]);

  // Listen for session updates
  useEffect(() => {
    const handleMinute = () => fetchWeekData();
    const handleComplete = () => fetchWeekData();
    window.addEventListener("timer:minute", handleMinute);
    window.addEventListener("timer:complete", handleComplete);
    return () => {
      window.removeEventListener("timer:minute", handleMinute);
      window.removeEventListener("timer:complete", handleComplete);
    };
  }, [fetchWeekData]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const { start, end } = getWeekBounds(currentWeek);
  const isCurrentWeek = getWeekBounds(new Date()).start.getTime() === start.getTime();

  const topCategory = chartData[0];

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">Weekly Focus Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatWeekRange(start, end)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className={cn("h-9", !isCurrentWeek && "font-semibold")}
              disabled={isCurrentWeek}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
              className="h-9"
              disabled={isCurrentWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as "pie" | "bar")} className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="pie" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              Pie Chart
            </TabsTrigger>
            <TabsTrigger value="bar" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Bar Chart
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-muted-foreground mb-2">No focus sessions this week</div>
            <p className="text-sm text-muted-foreground">
              Complete focus sessions to see your distribution
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Focus Time</div>
                <div className="text-2xl font-bold">{formatTime(totalMinutes)}</div>
              </div>
              {topCategory && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium text-muted-foreground">Top Category</div>
                  </div>
                  <div className="text-2xl font-bold">{topCategory.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {topCategory.formattedTime} ({topCategory.percentage.toFixed(1)}%)
                  </div>
                </div>
              )}
            </div>

            {/* Charts */}
            <TabsContent value="pie" className="mt-0">
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => percentage > 5 ? `${percentage.toFixed(1)}%` : ""}
                      outerRadius={120}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="minutes"
                      animationBegin={0}
                      animationDuration={800}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry.color }} className="text-sm">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="bar" className="mt-0">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={muted} opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: foreground, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: foreground, fontSize: 12 }}
                    label={{
                      value: "Focus Time (minutes)",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: foreground },
                    }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Category Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Category Breakdown</h3>
              <div className="space-y-2">
                {chartData.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.formattedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-semibold">{category.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">of total</div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

