import { useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/shared/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LeaderboardUser {
  id: string;
  full_name: string;
  points: number;
  rank: number;
}

export default function Leaderboard() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch leaderboard for both guests and authenticated users
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, points")
        .order("points", { ascending: false })
        .limit(100);

      if (error) throw error;

      const leaderboardData: LeaderboardUser[] = (data || []).map((user, index) => ({
        id: user.id,
        full_name: user.full_name || "Anonymous",
        points: user.points || 0,
        rank: index + 1,
      }));

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentUserRank = user ? leaderboard.findIndex((u) => u.id === user.id) + 1 : null;
  const currentUserData = user ? leaderboard.find((u) => u.id === user.id) : null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
    return "bg-accent/50 border-border/50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary shadow-soft-md flex items-center justify-center animate-pulse-glow">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground dark:text-white mb-2 tracking-tight">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Top performers by points</p>
        </div>

        {/* Guest Message */}
        {!user && (
          <Card className="mb-6 shadow-soft-lg border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                💡 <strong>Sign in</strong> to see your rank and compete on the leaderboard!{" "}
                <button 
                  onClick={() => navigate("/auth")} 
                  className="text-primary hover:underline font-medium"
                >
                  Get Started
                </button>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current User Rank */}
        {currentUserData && (
          <Card className="mb-6 shadow-soft-lg border-2 border-primary/20 glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                  <p className="text-2xl font-bold">{currentUserRank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Your Points</p>
                  <p className="text-2xl font-bold text-primary">{currentUserData.points}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card className="shadow-soft-lg border-2 border-primary/10 glass">
          <CardHeader>
            <CardTitle>Top Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No rankings yet. Start focusing to earn points!</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 50).map((userData) => (
                  <div
                    key={userData.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-smooth hover-lift",
                      getRankStyle(userData.rank),
                      userData.id === user?.id && "ring-2 ring-primary shadow-soft-md"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(userData.rank)}
                      </div>
                      <div>
                        <p className={cn(
                          "font-semibold",
                          userData.id === user?.id && "text-primary"
                        )}>
                          {userData.full_name}
                          {userData.id === user?.id && " (You)"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{userData.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

