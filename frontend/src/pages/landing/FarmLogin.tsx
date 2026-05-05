import { SignIn } from "@clerk/clerk-react";
import { AuthCard } from "./AuthCard";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function FarmLogin() {
  return (
    <AuthCard
      title="Farm Owner Sign In"
      subtitle="Access your farm dashboard and manage your operations"
      icon={<Home className="w-7 h-7" />}
      iconBg="bg-emerald-600"
      backLabel="← Back to Home"
      backTo="/"
    >
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/farm"
        signUpUrl="/farm-signup"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0 border-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50",
            formButtonPrimary: "bg-brand-600 hover:bg-brand-700",
            footerActionLink: "text-brand-600",
          },
        }}
      />
      <p className="text-center text-sm text-slate-500 mt-4">
        No account yet?{" "}
        <Link to="/farm-signup" className="text-brand-600 hover:underline font-medium">
          Register here
        </Link>
      </p>
    </AuthCard>
  );
}
