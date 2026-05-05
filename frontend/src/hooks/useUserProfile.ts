import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useApi } from "../lib/api";

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string;
  role: "farm_owner" | "mao" | "pao" | "veterinarian";
  municipality: string | null;
  contact_number: string | null;
  created_at: string;
}

export function useUserProfile() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const api = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user) { setLoading(false); return; }
    api.get("/users/me")
      .then(setProfile)
      .catch(() => setError("Profile not found"))
      .finally(() => setLoading(false));
  }, [isSignedIn, user?.id]);

  return { profile, loading, error, setProfile };
}
