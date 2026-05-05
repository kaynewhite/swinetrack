import { SignUp } from "@clerk/clerk-react";
import { AuthCard } from "./AuthCard";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export default function VetSignup() {
  return (
    <AuthCard
      title="Veterinarian Registration"
      subtitle="Create your veterinary professional account"
      icon={<Stethoscope className="w-7 h-7" />}
      iconBg="bg-violet-600"
      backLabel="← Back to Home"
      backTo="/"
    >
      <SignUp
        routing="hash"
        fallbackRedirectUrl="/vet"
        signInUrl="/vet-login"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none p-0 border-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
            footerActionLink: "text-violet-600",
          },
        }}
      />
      <p className="text-center text-sm text-slate-500 mt-4">
        Already registered?{" "}
        <Link to="/vet-login" className="text-violet-600 hover:underline font-medium">Sign in</Link>
      </p>
    </AuthCard>
  );
}
