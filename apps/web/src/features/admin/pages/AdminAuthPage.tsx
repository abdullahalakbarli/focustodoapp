import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/services/supabase/client";
import { useAdmin } from "@/shared/contexts/AdminContext";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

export default function AdminAuth() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAdmin, ensureAdmin, elevateWithCode } = useAdmin();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    ensureAdmin().then((ok) => {
      if (ok) navigate("/admin");
    });
  }, [userId, ensureAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await elevateWithCode(code.trim());
    setLoading(false);
    if (ok) {
      navigate("/admin");
    } else {
      alert("Invalid admin code");
    }
  };

  if (!userId) return null;
  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm border-2">
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-2xl font-bold text-center">Admin Access</h1>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter admin code"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Unlock Admin Panel"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center">
            Admin access is restricted. Changes are audited via the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


