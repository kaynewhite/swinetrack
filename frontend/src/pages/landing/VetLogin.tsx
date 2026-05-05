import { SignIn } from "@clerk/clerk-react";
import { AuthCard } from "./AuthCard";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export default function VetLogin() {
  return (
    <AuthCard
      title="Veterinarian Sign In"
      subtitle="Field officer and veterinary professional portal"
      icon={<Stethoscope className="w-7 h-7" />}
      iconBg="bg-violet-600"
      backLabel="← Back to Home"
      backTo="/"
    >
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/vet"
        signUpUrl="/vet-signup"
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
        New veterinarian?{" "}
        <Link to="/vet-signup" className="text-violet-600 hover:underline font-medium">Register here</Link>
      </p>
    </AuthCard>
  );
}
