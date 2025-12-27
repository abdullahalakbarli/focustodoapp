import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/services/supabase/client";
import { useAdmin } from "@/shared/contexts/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email?: string | null;
  role?: string | null;
  points?: number | null;
};

export default function AdminPanel() {
  const { isAdmin, ensureAdmin, revokeAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("user");
  const navigate = useNavigate();

  useEffect(() => {
    ensureAdmin().then((ok) => {
      if (!ok) navigate("/admin-auth");
    });
  }, [ensureAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, points")
      .order("full_name", { ascending: true, nullsFirst: true });
    if (!error) {
      setUsers(data as ProfileRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const onRoleChange = async (userId: string, role: string) => {
    const prev = users.slice();
    setUsers((arr) => arr.map((u) => (u.id === userId ? { ...u, role } : u)));
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) {
      alert("Failed to update role");
      setUsers(prev);
    }
  };

  const onDelete = async (userId: string) => {
    if (!confirm("Remove this user profile? This does not delete authentication account.")) return;
    const prev = users.slice();
    setUsers((arr) => arr.filter((u) => u.id !== userId));
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      alert("Failed to remove user");
      setUsers(prev);
    }
  };

  const onCreate = async () => {
    setCreating(true);
    const insert = { full_name: newName || null, email: newEmail || null, role: newRole };
    const { data, error } = await supabase.from("profiles").insert(insert).select("id, full_name, role, points").single();
    setCreating(false);
    if (error) {
      alert("Failed to create user");
      return;
    }
    setUsers((arr) => [data as ProfileRow, ...arr]);
    setNewName("");
    setNewEmail("");
    setNewRole("user");
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.full_name || "").toLowerCase().includes(q) || (u.role || "").toLowerCase().includes(q));
  }, [users, filter]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-24">
      <div className="container max-w-3xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={revokeAdmin}>Exit Admin</Button>
        </div>

        <Card className="shadow-soft border-2">
          <CardHeader>
            <CardTitle>Create User</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={onCreate} disabled={creating} className="w-full">{creating ? "Creating..." : "Add User"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name or role..." />
              <Button variant="secondary" onClick={fetchUsers} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
            </div>
            <div className="space-y-3">
              {filtered.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border-2">
                  <div>
                    <div className="font-semibold">{u.full_name || "Unnamed"}</div>
                    <div className="text-xs text-muted-foreground">ID: {u.id}</div>
                    <div className="text-xs text-muted-foreground">Points: {u.points ?? 0}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={(u.role || "user").toLowerCase()} onValueChange={(v) => onRoleChange(u.id, v)}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" onClick={() => onDelete(u.id)}>Remove</Button>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No users found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


