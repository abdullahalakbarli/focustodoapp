import { useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/shared/components/layout/BottomNav";
import { Calendar } from "@/shared/components/ui/calendar";
import { TaskList } from "../components/TaskList";
import { TaskForm } from "@/features/focus/components/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

export default function Planner() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleTaskCreated = () => {
    setDialogOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Task Planner</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSuccess={handleTaskCreated} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border pointer-events-auto"
            />
          </CardContent>
        </Card>

        <TaskList key={refreshKey} selectedDate={selectedDate} userId={user.id} />
      </div>

      <BottomNav />
    </div>
  );
}
