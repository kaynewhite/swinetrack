import { SignIn } from "@clerk/clerk-react";
import { AuthCard } from "./AuthCard";
import { Shield } from "lucide-react";

export default function PAOLogin() {
  return (
    <AuthCard
      title="PAO Provincial Monitor"
      subtitle="Provincial Agriculture Office — Restricted access portal"
      icon={<Shield className="w-7 h-7" />}
      iconBg="bg-slate-700"
    >
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/pao"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0 border-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-slate-700 hover:bg-slate-800",
            footerActionLink: "text-slate-700",
            footer: "hidden",
          },
        }}
      />
    </AuthCard>
  );
}
