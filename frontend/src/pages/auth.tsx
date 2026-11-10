import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Terminal,
  UserRound,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "@/components/layout/public-layout";
import { FibreArcCanvas } from "@/components/hero/originkit-hero-shaders";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PaymentModeBanner } from "@/components/payment-mode-banner";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().optional(),
    role: z.enum(["REQUESTER", "REVIEWER"]),
    acceptTerms: z.boolean().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const recoverySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type RecoveryValues = z.infer<typeof recoverySchema>;

export default function AuthPage({
  initialMode,
}: {
  initialMode?: "login" | "register" | "verify" | "recovery";
}) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, resendVerification, resetPassword, demoLogin, isSupabaseAuth } =
    useAuth();

  const derivedMode: "login" | "register" | "verify" | "recovery" =
    initialMode ||
    (location.pathname === "/register" || params.get("mode") === "register"
      ? "register"
      : location.pathname === "/verify-email" || params.get("mode") === "verify"
        ? "verify"
        : location.pathname === "/recover-password" || params.get("mode") === "recovery"
          ? "recovery"
          : "login");

  const [mode, setMode] = useState<"login" | "register" | "verify" | "recovery">(derivedMode);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Form password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email verification pending state
  const [pendingEmail, setPendingEmail] = useState<string>(params.get("email") ?? "");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(derivedMode);
  }, [derivedMode]);

  // Handle URL email verification indicators (e.g. from Supabase verification link)
  useEffect(() => {
    if (params.get("verified") === "1" || location.hash.includes("access_token")) {
      setInfoMessage("Email verified successfully! You can now sign in to your account.");
      setMode("login");
    }
  }, [params, location.hash]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (user) {
      if (user.role === "REVIEWER" && (!user.skills || user.skills.length === 0)) {
        navigate("/app/onboarding/skills", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "REQUESTER",
      acceptTerms: true,
    },
  });

  const recoveryForm = useForm<RecoveryValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" },
  });

  const selectedRole = registerForm.watch("role");
  const watchPassword = registerForm.watch("password") || "";

  // Password requirements checklist
  const hasMinLength = watchPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);

  function switchMode(next: "login" | "register" | "recovery" | "verify") {
    setMode(next);
    setError(null);
    setInfoMessage(null);
    if (next === "login") {
      navigate("/login", { replace: true });
    } else if (next === "register") {
      navigate("/register", { replace: true });
    } else {
      setParams({ mode: next }, { replace: true });
    }
  }

  async function onLogin(values: LoginValues) {
    setError(null);
    try {
      const loggedUser = await login(values.email, values.password);
      if (loggedUser.role === "REVIEWER" && (!loggedUser.skills || loggedUser.skills.length === 0)) {
        navigate("/app/onboarding/skills", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setPendingEmail(values.email);
        setMode("verify");
        setError(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : "Sign in failed. Check your email and password.");
      }
    }
  }

  async function onRegister(values: RegisterValues) {
    setError(null);
    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (result.needsEmailVerification) {
        setPendingEmail(values.email);
        setMode("verify");
        setInfoMessage(`Confirmation email dispatched to ${values.email}. Please verify to activate.`);
      } else if (result.user) {
        if (result.user.role === "REVIEWER") {
          navigate("/app/onboarding/skills", { replace: true });
        } else {
          navigate("/app", { replace: true });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please check your details.");
    }
  }

  async function onResendVerification() {
    if (!pendingEmail) return;
    setIsResending(true);
    setError(null);
    try {
      await resendVerification(pendingEmail);
      setInfoMessage(`Verification link resent to ${pendingEmail}.`);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  }

  async function onRecovery(values: RecoveryValues) {
    setError(null);
    try {
      await resetPassword(values.email);
      setInfoMessage(`Password reset link dispatched to ${values.email}. Check your inbox.`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to send reset instructions.");
    }
  }

  async function handleDemoSign(role: "requester" | "reviewer") {
    setError(null);
    try {
      const logged = await demoLogin(role);
      if (logged.role === "REVIEWER" && (!logged.skills || logged.skills.length === 0)) {
        navigate("/app/onboarding/skills", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Demo sign in unavailable.");
    }
  }

  return (
    <div className="grid min-h-dvh bg-[#F7F5EF] text-[#202722] lg:grid-cols-[1.04fr_1fr]">
      {/* Left architectural panel with OriginKit Hero 49 Woven Fibre Arc backdrop */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[#E5E1D7] bg-[#080C14] p-8 lg:flex xl:p-12 text-[#F8FAFC]">
        <FibreArcCanvas
          background="#04070F"
          baseColor="#1B4FD8"
          accentColor="#6FC8FF"
          highlight="#FFFFFF"
          density={20}
          speed={65}
          hover={160}
          reach={22}
          curve={28}
          spread={95}
          thickness={90}
          comb={150}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-75"
        />
        <div className="ok-hero-scrim" aria-hidden="true" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Brand tone="inverse" />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
            >
              <ArrowLeft className="size-3.5" /> Back to home
            </Link>
          </div>

          <div className="mt-12 max-w-lg">
            <h1 className="font-heading text-3xl font-bold leading-[1.15] tracking-tight text-[#F8FAFC] xl:text-4xl">
              Deterministic verification between autonomous agents and human specialists.
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-[#94A3B8] sm:text-sm">
              When an AI agent hits conflicting specifications, ambiguous runtime behavior, or high-risk code paths,
              TrustToPay routes the bounded blocker to a verified specialist, validates the submission in isolation, and
              returns a signed handback payload.
            </p>

            <div className="mt-6 space-y-2.5 border-t border-[#1E2B42] pt-5">
              {[
                {
                  title: "Supabase Authentication Architecture",
                  desc: "Enterprise email verification, PKCE session flows, and strict server-side role validation.",
                },
                {
                  title: "Proctored Skill Verification",
                  desc: "Compulsory camera and screen-sharing verification with sequential L1 Foundation to L3 Advanced stages.",
                },
                {
                  title: "Role Separation Without Admin Compromise",
                  desc: "Strictly partitioned Requester and Specialist workflows without elevated backdoors.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 text-xs text-[#CBD5E1]">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#38BDF8]" />
                  <div>
                    <span className="font-semibold text-white">{item.title} — </span>
                    <span className="text-[#94A3B8]">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-[#1E2B42] pt-4 font-mono text-[11px] text-[#64748B]">
          <span>SHA-256 Artifact Integrity · HMAC-SHA256 Handback</span>
          <span>{isSupabaseAuth ? "Supabase Auth Active" : "Local Auth Active"}</span>
        </div>
      </div>

      {/* Right authentication panel — Warm Ivory / Cream Design System */}
      <div className="flex flex-col justify-between bg-[#F7F5EF] text-[#202722]">
        <div className="flex items-center justify-between border-b border-[#E5E1D7] px-6 py-3.5 lg:border-b-0 lg:px-8 lg:py-5">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="hidden text-xs text-[#69736D] lg:block">
            {mode === "login" ? "New to TrustToPay?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-medium text-[#365FEA] hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#69736D] hover:text-[#202722] lg:hidden"
          >
            <ArrowLeft className="size-3.5" /> Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          <div className="w-full max-w-md space-y-4">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-[#202722] sm:text-2xl">
                {mode === "login"
                  ? "Sign in to TrustToPay"
                  : mode === "register"
                    ? "Create your TrustToPay account"
                    : mode === "recovery"
                      ? "Reset account password"
                      : "Verify email address"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#69736D] sm:text-sm">
                {mode === "login"
                  ? "Access your agent sessions, specialist workbench, verification logs, and payment ledger."
                  : mode === "register"
                    ? "Choose your workspace role to start escalating agent blockers or certifying technical skills."
                    : mode === "recovery"
                      ? "Enter your account email to receive secure password recovery instructions."
                      : "Check your email for the confirmation link to activate your account."}
              </p>
            </div>

            {/* Segmented mode switcher */}
            {(mode === "login" || mode === "register") && (
              <div
                role="tablist"
                aria-label="Authentication mode"
                className="grid grid-cols-2 rounded-lg border border-[#E5E1D7] bg-[#F0EEE7] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  onClick={() => switchMode("login")}
                  className={cn(
                    "rounded-md py-1.5 text-xs font-semibold transition-colors",
                    mode === "login"
                      ? "border border-[#E5E1D7] bg-[#FFFEFA] text-[#202722] shadow-sm"
                      : "border border-transparent text-[#69736D] hover:text-[#202722]",
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "register"}
                  onClick={() => switchMode("register")}
                  className={cn(
                    "rounded-md py-1.5 text-xs font-semibold transition-colors",
                    mode === "register"
                      ? "border border-[#E5E1D7] bg-[#FFFEFA] text-[#202722] shadow-sm"
                      : "border border-transparent text-[#69736D] hover:text-[#202722]",
                  )}
                >
                  Create Account
                </button>
              </div>
            )}

            {error ? <Alert tone="danger">{error}</Alert> : null}
            {infoMessage ? <Alert tone="success">{infoMessage}</Alert> : null}

            {/* Main Form Card */}
            <div className="rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-5 shadow-sm sm:p-6">
              {mode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-3.5" noValidate>
                  <Field label="Work or personal email" htmlFor="email" error={loginForm.formState.errors.email?.message}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      {...loginForm.register("email")}
                    />
                  </Field>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-xs font-semibold text-[#202722]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode("recovery")}
                        className="text-xs text-[#365FEA] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pr-9"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202722]"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-[11px] text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-[#365FEA] text-white hover:bg-[#365FEA]/90 text-xs font-semibold" loading={loginForm.formState.isSubmitting}>
                    <KeyRound className="size-4" /> Sign in to workspace
                  </Button>

                  {/* Sandbox Demo Quick Sign-in (only shown in offline local mock mode without Supabase) */}
                  {!isSupabaseAuth && (
                    <div className="mt-4 border-t border-[#E5E1D7] pt-3">
                      <p className="text-[11px] font-semibold text-[#69736D] text-center mb-2">
                        Instant Sandbox Demo Sign-in:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoSign("requester")}
                          className="border-[#E5E1D7] text-xs hover:bg-[#F0EEE7]"
                        >
                          <Bot className="size-3.5 mr-1 text-[#365FEA]" /> Demo Requester
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoSign("reviewer")}
                          className="border-[#E5E1D7] text-xs hover:bg-[#F0EEE7]"
                        >
                          <Code2 className="size-3.5 mr-1 text-[#438866]" /> Demo Specialist
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              ) : mode === "register" ? (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3.5" noValidate>
                  <Field label="Full name" htmlFor="name" error={registerForm.formState.errors.name?.message}>
                    <Input
                      id="name"
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      {...registerForm.register("name")}
                    />
                  </Field>

                  <Field label="Email address" htmlFor="reg-email" error={registerForm.formState.errors.email?.message}>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="ada@engineering.org"
                      autoComplete="email"
                      {...registerForm.register("email")}
                    />
                  </Field>

                  {/* Password with Visibility Toggle */}
                  <div className="space-y-1">
                    <label htmlFor="reg-password" className="text-xs font-semibold text-[#202722]">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        className="pr-9"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202722]"
                        title={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    {/* Compact Password Requirements Checklist */}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                      <span className={cn("inline-flex items-center gap-1", hasMinLength ? "text-[#438866]" : "text-[#69736D]")}>
                        {hasMinLength ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-[#69736D]" />}
                        8+ characters
                      </span>
                      <span className={cn("inline-flex items-center gap-1", hasLetter ? "text-[#438866]" : "text-[#69736D]")}>
                        {hasLetter ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-[#69736D]" />}
                        1+ letter
                      </span>
                      <span className={cn("inline-flex items-center gap-1", hasNumber ? "text-[#438866]" : "text-[#69736D]")}>
                        {hasNumber ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-[#69736D]" />}
                        1+ number
                      </span>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-[11px] text-red-600">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password with Visibility Toggle */}
                  <div className="space-y-1">
                    <label htmlFor="confirm-password" className="text-xs font-semibold text-[#202722]">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        className="pr-9"
                        {...registerForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202722]"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-[11px] text-red-600">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Account Type Selection (Requester vs Reviewer only - Admin prohibited) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-[#202722]">
                      Account Type
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => registerForm.setValue("role", "REQUESTER", { shouldValidate: true })}
                        className={cn(
                          "flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors",
                          selectedRole === "REQUESTER"
                            ? "border-[#365FEA] bg-[#365FEA]/10 text-[#202722]"
                            : "border-[#E5E1D7] bg-[#FFFEFA] text-[#69736D] hover:border-[#D2CDC0] hover:text-[#202722]",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Bot className="size-4 text-[#365FEA]" />
                          {selectedRole === "REQUESTER" ? (
                            <CheckCircle2 className="size-3.5 text-[#365FEA]" />
                          ) : null}
                        </div>
                        <span className="mt-1 font-heading text-xs font-bold text-[#202722]">Requester</span>
                        <span className="mt-0.5 text-[11px] leading-4 text-[#69736D]">
                          Run AI agents &amp; fund human reviews
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => registerForm.setValue("role", "REVIEWER", { shouldValidate: true })}
                        className={cn(
                          "flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors",
                          selectedRole === "REVIEWER"
                            ? "border-[#438866] bg-[#438866]/10 text-[#202722]"
                            : "border-[#E5E1D7] bg-[#FFFEFA] text-[#69736D] hover:border-[#D2CDC0] hover:text-[#202722]",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Code2 className="size-4 text-[#438866]" />
                          {selectedRole === "REVIEWER" ? (
                            <CheckCircle2 className="size-3.5 text-[#438866]" />
                          ) : null}
                        </div>
                        <span className="mt-1 font-heading text-xs font-bold text-[#202722]">Reviewer (Specialist)</span>
                        <span className="mt-0.5 text-[11px] leading-4 text-[#69736D]">
                          Certify skills, review blockers &amp; earn rewards
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Terms acceptance */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2 text-xs text-[#69736D] cursor-pointer">
                      <input
                        type="checkbox"
                        {...registerForm.register("acceptTerms")}
                        className="mt-0.5 rounded border-[#E5E1D7] text-[#365FEA] focus:ring-[#365FEA]"
                      />
                      <span className="leading-tight">
                        I accept the terms of service and acknowledge the{" "}
                        <Link to="/privacy" className="text-[#365FEA] underline">
                          Data Governance Notice
                        </Link>
                        .
                      </span>
                    </label>
                    {registerForm.formState.errors.acceptTerms && (
                      <p className="text-[11px] text-red-600">
                        {registerForm.formState.errors.acceptTerms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#365FEA] text-white hover:bg-[#365FEA]/90 text-xs font-semibold"
                    loading={registerForm.formState.isSubmitting}
                  >
                    <UserRound className="size-4" /> Create Account
                  </Button>
                </form>
              ) : mode === "recovery" ? (
                <form onSubmit={recoveryForm.handleSubmit(onRecovery)} className="space-y-3.5">
                  <Field label="Account email address" htmlFor="rec-email" error={recoveryForm.formState.errors.email?.message}>
                    <Input
                      id="rec-email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      {...recoveryForm.register("email")}
                    />
                  </Field>

                  <Button type="submit" className="w-full bg-[#365FEA] text-white hover:bg-[#365FEA]/90 text-xs font-semibold" loading={recoveryForm.formState.isSubmitting}>
                    <Mail className="size-4" /> Send Recovery Link
                  </Button>

                  <div className="text-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-[#365FEA] hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              ) : (
                /* Email Verification Pending State */
                <div className="space-y-4 text-center py-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#365FEA]/10 text-[#365FEA]">
                    <Mail className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-heading text-base font-bold text-[#202722]">Verify your email address</h3>
                    <p className="mt-1 text-xs text-[#69736D] leading-relaxed">
                      We have dispatched a verification email to:
                      <br />
                      <strong className="text-[#202722]">{pendingEmail || "your email address"}</strong>
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#E5E1D7] bg-[#F7F5EF] p-3 text-[11px] text-[#69736D] text-left">
                    Please click the activation link in the email message to confirm your identity. Once confirmed, you can proceed directly to your onboarding.
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onResendVerification}
                      disabled={isResending || resendCooldown > 0}
                      className="w-full border-[#E5E1D7] text-xs font-semibold"
                    >
                      <RefreshCw className={cn("size-3.5 mr-1.5", isResending && "animate-spin")} />
                      {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend Verification Email"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => switchMode("login")}
                      className="w-full text-xs text-[#365FEA]"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <PaymentModeBanner compact />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E1D7] pt-3 text-xs text-[#69736D]">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-[#438866]" /> Supabase Auth &amp; Verified Claims
              </span>
              <Link to="/app/docs" className="inline-flex items-center gap-1 text-[#365FEA] hover:underline">
                <Terminal className="size-3.5" /> Architecture docs <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 text-center text-[11px] text-[#69736D] lg:px-8">
          By signing in or creating an account, you acknowledge the{" "}
          <Link to="/privacy" className="text-[#365FEA] underline underline-offset-2">
            Data Governance Notice
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
