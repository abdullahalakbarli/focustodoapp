import { Award, Lock, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { usePoints, MILESTONES } from "@/shared/hooks/usePoints";

export const AchievementsDialog = () => {
  const { points } = usePoints();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Award className="h-4 w-4" />
          Achievements
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Your Achievements
          </DialogTitle>
          <DialogDescription>
            Earn points by completing focus sessions. 1 point = 10 minutes of focus time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Points</p>
            <p className="text-4xl font-bold text-primary">{points}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Milestones</h3>
            {MILESTONES.map((milestone, index) => {
              const isUnlocked = points >= milestone.points;
              const progress = isUnlocked
                ? 100
                : Math.min((points / milestone.points) * 100, 99);

              return (
                <Card
                  key={milestone.name}
                  className={`transition-all ${
                    isUnlocked
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 opacity-60"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <div className="p-1.5 rounded-full bg-primary/20">
                            <Check className={`h-4 w-4 ${milestone.color}`} />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-full bg-muted">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className={`font-semibold ${milestone.color}`}>
                            {milestone.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.points} points
                          </p>
                        </div>
                      </div>
                      {isUnlocked && (
                        <Award className={`h-5 w-5 ${milestone.color}`} />
                      )}
                    </div>
                    {!isUnlocked && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground text-right">
                          {points} / {milestone.points}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Complete focus sessions to earn more points and unlock achievements!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
