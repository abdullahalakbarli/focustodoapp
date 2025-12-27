import { Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { usePoints } from "@/shared/hooks/usePoints";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const PointsDisplay = () => {
  const { points, loading, getCurrentLevel, getPointsToNextLevel } = usePoints();

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-4">
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const pointsToNext = getPointsToNextLevel();

  return (
    <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{points}</p>
            </div>
          </div>
          
          {currentLevel && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Sparkles className={`h-4 w-4 ${currentLevel.color}`} />
                <p className={`text-sm font-semibold ${currentLevel.color}`}>
                  {currentLevel.name}
                </p>
              </div>
              {pointsToNext > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {pointsToNext} to next level
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
