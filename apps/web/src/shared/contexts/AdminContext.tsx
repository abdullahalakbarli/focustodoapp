import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/shared/services/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  ensureAdmin: () => Promise<boolean>;
  elevateWithCode: (code: string) => Promise<boolean>;
  revokeAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

async function adminApiRequest(path: string, body?: Record<string, string>) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.ok;
}

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
    try {
      const ok = await adminApiRequest("/admin/elevate", { code: code.trim() });
      if (!ok) return false;
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  };

  const revokeAdmin = async () => {
    try {
      const ok = await adminApiRequest("/admin/revoke");
      if (ok) setIsAdmin(false);
    } catch {
      // ignore
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loading, ensureAdmin, elevateWithCode, revokeAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
