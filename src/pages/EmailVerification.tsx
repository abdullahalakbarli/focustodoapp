import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function EmailVerification() {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get("token") || "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing or invalid verification link.");
      return;
    }

    if (!API_BASE_URL) {
      setStatus("error");
      setMessage("Verification API is not configured.");
      return;
    }

    const run = async () => {
      setStatus("loading");
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        setStatus("success");
        setMessage("Your email has been verified. You can now log in.");
        setTimeout(() => navigate("/auth"), 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    run();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/8 via-background to-accent/10">
      <Card className="w-full max-w-md shadow-soft-lg glass border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email verification</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-sm text-muted-foreground text-center">
              Verifying your email, please wait...
            </p>
          )}
          {status === "success" && (
            <p className="text-sm text-muted-foreground text-center">{message}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive text-center">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


