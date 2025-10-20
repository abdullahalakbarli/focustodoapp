import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/reports/StatsCards";
import { FocusChart } from "@/components/reports/FocusChart";
import { ExportButtons } from "@/components/reports/ExportButtons";

export default function Reports() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container max-w-4xl mx-auto px-4 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Progress</h1>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="daily" className="space-y-6">
            <ExportButtons userId={user.id} period="daily" />
            <StatsCards period="daily" userId={user.id} />
            <FocusChart period="daily" userId={user.id} />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <ExportButtons userId={user.id} period="weekly" />
            <StatsCards period="weekly" userId={user.id} />
            <FocusChart period="weekly" userId={user.id} />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <ExportButtons userId={user.id} period="monthly" />
            <StatsCards period="monthly" userId={user.id} />
            <FocusChart period="monthly" userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
