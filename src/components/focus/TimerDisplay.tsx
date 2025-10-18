import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTimer } from "@/contexts/TimerContext";

export const TimerDisplay = () => {
  const { minutes, seconds, isActive, category, totalSeconds, toggleTimer, resetTimer } = useTimer();

  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <Card className="shadow-soft mt-6">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="text-6xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{category}</p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              variant={isActive ? "secondary" : "default"}
              onClick={toggleTimer}
              className="rounded-full h-16 w-16"
            >
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
              className="rounded-full h-16 w-16"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
