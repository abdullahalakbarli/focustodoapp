import { useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";

interface Task {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  completed: boolean;
  scheduled_date: string | null;
  recurrence: string | null;
  color: string;
}

interface TaskListProps {
  selectedDate: Date;
  userId: string;
}

export const TaskList = ({ selectedDate, userId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [selectedDate, userId]);

  const fetchTasks = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("scheduled_date", format(selectedDate, "yyyy-MM-dd"))
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !currentStatus })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } else {
      fetchTasks();
    }
  };

  return (
    <Card className="shadow-soft text-sm">
      <CardHeader>
        <CardTitle className="text-lg">Tasks for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No tasks scheduled for this day
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors border-l-4 p-2"
                style={{ borderLeftColor: task.color }}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                  className="mt-0.5 h-4 w-4"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <p className={task.completed ? "line-through text-muted-foreground text-sm" : "text-sm"}>
                        {task.name}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5"
                    >
                      {task.duration_minutes}m
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize px-2 py-0.5"
                    >
                      {task.category}
                    </Badge>
                    {task.recurrence && (
                      <Badge
                        variant="outline"
                        className="text-xs capitalize px-2 py-0.5"
                      >
                        {task.recurrence}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
