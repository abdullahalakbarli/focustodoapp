import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  ensureAdmin: () => Promise<boolean>;
  elevateWithCode: (code: string) => Promise<boolean>;
  revokeAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const readRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (!error) {
      const admin = (data?.role || "").toLowerCase() === "admin";
      setIsAdmin(admin);
      setLoading(false);
      return admin;
    }
    setIsAdmin(false);
    setLoading(false);
    return false;
  };

  useEffect(() => {
    readRole();
  }, []);

  const ensureAdmin = async () => {
    if (isAdmin) return true;
    return await readRole();
  };

  const elevateWithCode = async (code: string) => {
    const expected = ((import.meta as any).env?.VITE_ADMIN_CODE as string | undefined) || "admin13";
    if (code.trim() !== expected) {
      return false;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", session.user.id);
    if (error) return false;
    setIsAdmin(true);
    return true;
  };

  const revokeAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("profiles").update({ role: "user" }).eq("id", session.user.id);
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loading, ensureAdmin, elevateWithCode, revokeAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};


