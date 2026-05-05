import { SignUp } from "@clerk/clerk-react";
import { AuthCard } from "./AuthCard";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function FarmSignup() {
  return (
    <AuthCard
      title="Register as Farm Owner"
      subtitle="Create your account to register your farm and track swine health"
      icon={<Home className="w-7 h-7" />}
      iconBg="bg-emerald-600"
      backLabel="← Back to Home"
      backTo="/"
    >
      <SignUp
        routing="hash"
        fallbackRedirectUrl="/farm"
        signInUrl="/farm-login"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0 border-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-brand-600 hover:bg-brand-700",
            footerActionLink: "text-brand-600",
          },
        }}
      />
      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link to="/farm-login" className="text-brand-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
