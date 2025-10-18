import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  completed: boolean;
  scheduled_date: string | null;
  recurrence: string | null;
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
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("scheduled_date", dateStr)
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
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Tasks for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No tasks scheduled for this day
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={task.completed ? "line-through text-muted-foreground" : ""}>
                      {task.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {task.duration_minutes}m
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {task.category}
                    </Badge>
                    {task.recurrence && (
                      <Badge variant="outline" className="text-xs capitalize">
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
