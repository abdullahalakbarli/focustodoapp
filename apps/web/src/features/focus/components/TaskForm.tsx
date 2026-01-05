import { useState } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { Database } from "@/shared/services/supabase/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface TaskFormProps {
  onSuccess: () => void;
}

const categories = [
  "study",
  "work",
  "coding",
  "reading",
  "exercise",
  "meditation",
  "design",
  "writing",
  "meeting",
  "other",
];

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export const TaskForm = ({ onSuccess }: TaskFormProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("study");
  const [duration, setDuration] = useState(25);
  const [scheduledDate, setScheduledDate] = useState<Date>(() => new Date());
  const [recurrence, setRecurrence] = useState<string>();
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const effectiveDate = scheduledDate ?? new Date();

    const { error } = await supabase.from("tasks").insert([{
      name,
      category: category.toLowerCase().trim(),
      duration_minutes: duration,
      scheduled_date: format(effectiveDate, "yyyy-MM-dd"),
      recurrence,
      color,
      user_id: user.id,
    }]);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input
          id="task-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter task name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Scheduled Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !scheduledDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduledDate ? format(scheduledDate, "PPP") : format(new Date(), "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={scheduledDate}
              onSelect={(date) => setScheduledDate(date ?? new Date())}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurrence">Recurrence (Optional)</Label>
        <Select value={recurrence} onValueChange={setRecurrence}>
          <SelectTrigger>
            <SelectValue placeholder="Select recurrence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Task Color</Label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              onClick={() => setColor(presetColor)}
              className={cn(
                "w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
                color === presetColor ? "border-foreground scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: presetColor }}
              aria-label={`Select ${presetColor} color`}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
};
