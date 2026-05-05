import { SignIn } from "@clerk/clerk-react";
import { AuthCard } from "./AuthCard";
import { Building2 } from "lucide-react";

export default function MAOLogin() {
  return (
    <AuthCard
      title="MAO Administrator Sign In"
      subtitle="Municipal Agriculture Office — Secure administrative portal"
      icon={<Building2 className="w-7 h-7" />}
      iconBg="bg-blue-600"
      backLabel="← Back to Home"
      backTo="/"
    >
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/mao"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0 border-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            footerActionLink: "text-blue-600",
          },
        }}
      />
    </AuthCard>
  );
}
