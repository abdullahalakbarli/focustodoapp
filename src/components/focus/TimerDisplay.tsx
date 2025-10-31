import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTimer } from "@/contexts/TimerContext";
import { cn } from "@/lib/utils";

export const TimerDisplay = () => {
  const { minutes, seconds, isActive, category, totalSeconds, toggleTimer, resetTimer } = useTimer();

  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="shadow-soft-lg mt-8 overflow-hidden border-2 border-primary/10 animate-fade-in glass">
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-8">
          {/* Circular Progress Timer */}
          <div className="relative flex items-center justify-center" style={{ minHeight: '280px' }}>
            {/* Background circle */}
            <svg className="absolute" width="280" height="280">
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                className="opacity-20"
              />
              {/* Progress circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  "transition-all duration-1000 ease-linear",
                  isActive && "animate-pulse-glow"
                )}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>

            {/* Timer Display - shifted downward for better balance */}
            <div className="relative z-10 flex flex-col items-center justify-center" style={{ marginTop: '30px' }}>
              <div className="text-6xl font-bold tabular-nums tracking-tight text-foreground drop-shadow-sm leading-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="mt-4 px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary">{category}</p>
              </div>
              <div className="mt-2.5 text-xs text-muted-foreground font-medium">
                {isActive ? "Focus Mode Active" : "Ready to Focus"}
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="px-4">
            <Progress 
              value={progress} 
              className="h-2.5 bg-muted/50"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center items-center px-4">
            <Button
              size="lg"
              variant={isActive ? "secondary" : "default"}
              onClick={toggleTimer}
              className={cn(
                "rounded-full h-20 w-20 shadow-soft-lg",
                isActive && "animate-pulse"
              )}
            >
              {isActive ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
            <Button
              size="lg"
              variant="glass"
              onClick={resetTimer}
              className="rounded-full h-16 w-16"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>

          {/* Status indicator */}
          <div className="flex justify-center">
            <div className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              isActive ? "bg-success animate-pulse shadow-glow" : "bg-muted"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
