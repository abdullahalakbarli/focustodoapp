import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/shared/services/supabase/client";
import FocusPage from "@/features/focus/pages/FocusPage";
import LandingPage from "@/features/auth/pages/LandingPage";

export const HomeRoute = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show FocusPage for authenticated users, LandingPage for guests
  return user ? <FocusPage /> : <LandingPage />;
};

