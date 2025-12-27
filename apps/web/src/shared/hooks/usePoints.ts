import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/services/supabase/client";

// Gamification milestones (points needed for each level)
export const MILESTONES = [
  { name: "Bronze", points: 10, color: "text-orange-600" },
  { name: "Silver", points: 50, color: "text-gray-400" },
  { name: "Gold", points: 100, color: "text-yellow-500" },
  { name: "Platinum", points: 200, color: "text-cyan-400" },
  { name: "Diamond", points: 500, color: "text-purple-500" },
];

/**
 * Hook for managing user gamification points
 * Converts focus time to points: 1 point per 10 minutes
 */
export const usePoints = () => {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch current points from database
  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setPoints(data?.points || 0);
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate points from minutes: 1 point per 10 minutes
  const calculatePoints = (minutes: number): number => {
    return Math.floor(minutes / 10);
  };

  // Add points to user's total
  const addPoints = async (earnedPoints: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newTotal = points + earnedPoints;

      const { error } = await supabase
        .from("profiles")
        .update({ points: newTotal })
        .eq("id", session.user.id);

      if (error) throw error;
      setPoints(newTotal);
      
      return newTotal;
    } catch (error) {
      console.error("Error adding points:", error);
      return points;
    }
  };

  // Get current achievement level
  const getCurrentLevel = () => {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (points >= MILESTONES[i].points) {
        return MILESTONES[i];
      }
    }
    return null;
  };

  // Get next milestone to achieve
  const getNextMilestone = () => {
    for (const milestone of MILESTONES) {
      if (points < milestone.points) {
        return milestone;
      }
    }
    return null;
  };

  // Calculate points needed for next level
  const getPointsToNextLevel = () => {
    const next = getNextMilestone();
    return next ? next.points - points : 0;
  };

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    const handlePointsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail === "number") {
        setPoints(detail);
        setLoading(false);
      } else {
        fetchPoints();
      }
    };

    const handlePointsRefresh = () => {
      fetchPoints();
    };

    window.addEventListener("points:updated", handlePointsUpdated as EventListener);
    window.addEventListener("points:refresh", handlePointsRefresh);

    return () => {
      window.removeEventListener("points:updated", handlePointsUpdated as EventListener);
      window.removeEventListener("points:refresh", handlePointsRefresh);
    };
  }, [fetchPoints]);

  return {
    points,
    loading,
    calculatePoints,
    addPoints,
    getCurrentLevel,
    getNextMilestone,
    getPointsToNextLevel,
    fetchPoints,
  };
};
