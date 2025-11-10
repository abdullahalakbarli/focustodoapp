import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Moon, Sun, Bell, Edit } from "lucide-react";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { useThemeMode, ThemeMode } from "@/contexts/ThemeContext";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { mode: themeModeGlobal, setTheme } = useThemeMode();
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setThemeMode(themeModeGlobal);
  }, [themeModeGlobal]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      if (data.theme_mode && data.theme_mode !== themeMode) {
        await setTheme(data.theme_mode as ThemeMode);
      }
      setThemeMode((data.theme_mode as ThemeMode) || "light");
      setNotificationsEnabled(data.notifications_enabled ?? true);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const updateSetting = async (field: string, value: any) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Updated",
        description: "Setting saved successfully",
      });
      return true;
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeMode]);

  const toggleTheme = async (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    const previousTheme = themeMode;
    setThemeMode(newTheme);
    await setTheme(newTheme);
    const success = await updateSetting("theme_mode", newTheme);
    if (!success) {
      await setTheme(previousTheme);
      setThemeMode(previousTheme);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await updateSetting("notifications_enabled", newValue);
  };

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        <ProfileInfo profile={profile} user={user} />

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/edit-profile")}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {themeMode === "light" ? (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
                <Label>Dark Mode</Label>
              </div>
              <Switch checked={themeMode === "dark"} onCheckedChange={(checked) => toggleTheme(checked)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Label>Notifications</Label>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
