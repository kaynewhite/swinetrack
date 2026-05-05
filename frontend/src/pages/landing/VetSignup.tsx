import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard } from "./AuthCard";
import { Stethoscope, Eye, EyeOff, AlertCircle, Loader2, Mail } from "lucide-react";

export default function VetSignup() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState<"register" | "verify">("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const nameParts = fullName.trim().split(" ");
      await signUp.create({
        emailAddress: email,
        password,
        firstName: nameParts[0] || fullName,
        lastName: nameParts.slice(1).join(" ") || "",
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/vet");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={step === "register" ? "Veterinarian Registration" : "Verify Your Email"}
      subtitle={
        step === "register"
          ? "Create your veterinary professional account"
          : `We sent a 6-digit code to ${email}`
      }
      icon={step === "register" ? <Stethoscope className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
      iconBg="bg-violet-600"
      backLabel="← Back to Home"
      backTo="/"
    >
      {step === "register" ? (
        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Juan dela Cruz"
              autoComplete="name"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
            ) : "Create Account"}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already registered?{" "}
              <Link to="/vet-login" className="text-violet-600 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-center tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition placeholder-slate-400"
            />
            <p className="text-xs text-slate-500 mt-1.5">Check your inbox and spam folder</p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</>
            ) : "Verify Email"}
          </button>

          <button
            type="button"
            onClick={() => setStep("register")}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition"
          >
            ← Back to registration
          </button>
        </form>
      )}
    </AuthCard>
  );
}
