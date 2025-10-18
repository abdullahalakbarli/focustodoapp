import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { TimerDisplay } from "@/components/focus/TimerDisplay";
import { CategorySelector } from "@/components/focus/CategorySelector";
import { TaskForm } from "@/components/focus/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Focus() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Study");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSessionComplete = async (durationMinutes: number) => {
    if (!user) return;

    const { error } = await supabase.from("focus_sessions").insert([{
      category: selectedCategory.toLowerCase() as Database["public"]["Enums"]["task_category"],
      duration_minutes: durationMinutes,
      user_id: user.id,
    }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save focus session",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Great work!",
        description: `${durationMinutes} minute focus session completed`,
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container max-w-md mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            FocusMind
          </h1>
          <p className="text-muted-foreground">Stay focused, be productive</p>
        </div>

        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <TimerDisplay
          category={selectedCategory}
          onSessionComplete={handleSessionComplete}
        />

        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogTrigger asChild>
            <Button className="w-full mt-6" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setShowTaskForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <BottomNav />
    </div>
  );
}
