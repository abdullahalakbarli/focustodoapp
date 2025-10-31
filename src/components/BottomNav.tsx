import { Home, BarChart3, Calendar, User, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Focus", path: "/" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Calendar, label: "Planner", path: "/planner" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <div className="glass-strong rounded-2xl border-2 border-border/50 shadow-soft-lg max-w-md mx-auto">
        <div className="flex justify-around items-center h-18 px-3 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl transition-smooth min-w-[64px] active-press",
                  isActive
                    ? "text-primary bg-primary/15 shadow-soft scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30 hover-lift"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
