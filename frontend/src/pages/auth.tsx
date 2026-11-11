import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  FileCheck2,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Terminal,
  UserRound,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "@/components/layout/public-layout";
import { SupabaseLogo } from "@/components/partner-logos";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
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
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Accept the data governance terms to create your account.",
    }),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const recoverySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type RecoveryValues = z.infer<typeof recoverySchema>;
type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

type AuthMode = "login" | "register" | "verify" | "recovery" | "update-password" | "expired";

export default function AuthPage({
  initialMode,
}: {
  initialMode?: AuthMode;
}) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    login,
    register,
    resendVerification,
    resetPassword,
    updatePassword,
    demoLogin,
    isSupabaseAuth,
  } = useAuth();

  const hasLinkError =
    Boolean(params.get("error")) ||
    Boolean(params.get("error_description")) ||
    location.hash.includes("error=") ||
    location.hash.includes("otp_expired");

  const hasRecoveryToken =
    location.hash.includes("type=recovery") ||
    params.get("type") === "recovery" ||
    (params.get("mode") === "recovery" && location.hash.includes("access_token"));

  const derivedMode: AuthMode = hasLinkError
    ? "expired"
    : hasRecoveryToken
      ? "update-password"
      : initialMode ||
        (location.pathname === "/register" || params.get("mode") === "register"
          ? "register"
          : location.pathname === "/verify-email" || params.get("mode") === "verify"
            ? "verify"
            : location.pathname === "/recover-password" || params.get("mode") === "recovery"
              ? "recovery"
              : "login");

  const [mode, setMode] = useState<AuthMode>(derivedMode);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pendingEmail, setPendingEmail] = useState<string>(params.get("email") ?? "");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(derivedMode);
  }, [derivedMode]);

  useEffect(() => {
    if (hasLinkError) {
      const desc = params.get("error_description");
      setError(
        desc
          ? decodeURIComponent(desc.replace(/\+/g, " "))
          : "This verification or password reset link is invalid or has expired.",
      );
      return;
    }
    if (params.get("verified") === "1" || (location.hash.includes("access_token") && !hasRecoveryToken)) {
      setInfoMessage("Email verified successfully. You can now sign in to your workspace.");
      setMode("login");
    }
  }, [params, location.hash, hasLinkError, hasRecoveryToken]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (user && mode !== "update-password") {
      if (user.role === "REVIEWER" && (!user.skills || user.skills.length === 0)) {
        navigate("/app/onboarding/skills", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [user, navigate, mode]);

  const initialRoleParam = params.get("role")?.toUpperCase();
  const defaultRole: "REQUESTER" | "REVIEWER" =
    initialRoleParam === "REVIEWER" ? "REVIEWER" : "REQUESTER";

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
      role: defaultRole,
      acceptTerms: true,
    },
  });

  const recoveryForm = useForm<RecoveryValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" },
  });

  const updatePasswordForm = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const selectedRole = registerForm.watch("role");
  const watchPassword = registerForm.watch("password") || "";

  const hasMinLength = watchPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);

  function switchMode(next: AuthMode) {
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
        setInfoMessage(`Confirmation email dispatched to ${values.email}. Open the link to verify your account.`);
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
      setInfoMessage(`Password reset link sent to ${values.email}. Check your inbox.`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to send password reset instructions.");
    }
  }

  async function onUpdatePassword(values: UpdatePasswordValues) {
    setError(null);
    try {
      await updatePassword(values.password);
      setInfoMessage("Password updated successfully. You can continue into your workspace.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to update password. Request a new reset link.");
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
    <div className="grid min-h-dvh bg-[#F5F7FC] text-[#141B2D] lg:grid-cols-[1.02fr_1fr]">
      {/* Left Solid Deep Navy Panel (#10172A, zero gradients) */}
      <div className="hidden flex-col justify-between border-r border-[#1E293B] bg-[#10172A] p-8 text-white lg:flex xl:p-12">
        <div className="flex items-center justify-between">
          <Brand tone="inverse" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" /> Back to home
          </Link>
        </div>

        <div className="my-auto max-w-lg space-y-6 py-8">
          <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-[36px]">
            When AI gets stuck, verified specialists move work forward.
          </h1>

          <p className="text-[15px] leading-6 text-[#CBD5E1]">
            Hand off blocked tasks to skilled human reviewers, run automated security checks on every deliverable, and
            track payments cleanly.
          </p>

          {/* Compact Flow Preview */}
          <div className="rounded-xl border border-[#1E293B] bg-[#162038] p-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-[#20BCE5]">
                <Bot className="size-4" /> AI Task
              </span>
              <span className="text-[#475569]">→</span>
              <span className="inline-flex items-center gap-1.5 text-white">
                <Code2 className="size-4 text-[#4263EB]" /> Human Specialist
              </span>
              <span className="text-[#475569]">→</span>
              <span className="inline-flex items-center gap-1.5 text-[#12A875]">
                <FileCheck2 className="size-4" /> Verified Result
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#1E293B] pt-5">
            {[
              {
                title: "Verified Account Access",
                desc: "Protected email confirmation and password recovery powered by Supabase.",
              },
              {
                title: "Structured Skill Verification",
                desc: "Specialists qualify through sequential assessments before claiming matching tasks.",
              },
              {
                title: "Role-Separated Workspaces",
                desc: "Dedicated experiences for Requesters submitting tasks and Specialists completing work.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5 text-xs text-[#CBD5E1]">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#12A875]" />
                <div>
                  <span className="font-semibold text-white">{item.title}: </span>
                  <span className="text-[#94A3B8]">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#1E293B] pt-4 text-xs text-[#94A3B8]">
          <SupabaseLogo tone="inverse" className="h-5" />
          <span className="text-xs text-[#94A3B8]">
            {isSupabaseAuth ? "Protected by Supabase Auth" : "Session Auth"}
          </span>
        </div>
      </div>

      {/* Right Clean Light Form Surface */}
      <div className="flex flex-col justify-between bg-[#F5F7FC]">
        <div className="flex items-center justify-between border-b border-[#E4E9F2] bg-[#FFFFFF] px-6 py-3.5 lg:border-b-0 lg:bg-transparent lg:px-10 lg:py-6">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="hidden text-xs text-[#68738A] lg:block">
            {mode === "login" ? "New to TrustToPay?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-[#4263EB] hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#68738A] hover:text-[#141B2D] lg:hidden"
          >
            <ArrowLeft className="size-3.5" /> Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#141B2D]">
                {mode === "login"
                  ? "Sign in to TrustToPay"
                  : mode === "register"
                    ? "Create your TrustToPay account"
                    : mode === "recovery"
                      ? "Reset account password"
                      : mode === "update-password"
                        ? "Set a new password"
                        : mode === "expired"
                          ? "Verification link expired"
                          : "Verify email address"}
              </h2>
              <p className="text-xs leading-5 text-[#68738A] sm:text-sm">
                {mode === "login"
                  ? "Access your agent sessions, specialist workbench, verification logs, and payment ledger."
                  : mode === "register"
                    ? "Select your workspace role to start escalating blockers or certifying domain skills."
                    : mode === "recovery"
                      ? "Enter your account email to receive password recovery instructions."
                      : mode === "update-password"
                        ? "Enter and confirm your new workspace password."
                        : mode === "expired"
                          ? "This confirmation or recovery link can no longer be used. Request a fresh link below."
                          : "Confirm your email address using the link sent to your inbox."}
              </p>
            </div>

            {(mode === "login" || mode === "register") && (
              <div
                role="tablist"
                aria-label="Authentication mode"
                className="grid grid-cols-2 rounded-lg border border-[#E4E9F2] bg-[#EDF0F6] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  onClick={() => switchMode("login")}
                  className={cn(
                    "min-h-9 rounded-md text-xs font-semibold transition-colors",
                    mode === "login"
                      ? "border border-[#E4E9F2] bg-[#FFFFFF] text-[#141B2D] shadow-surface"
                      : "border border-transparent text-[#4E596E] hover:text-[#141B2D]",
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
                    "min-h-9 rounded-md text-xs font-semibold transition-colors",
                    mode === "register"
                      ? "border border-[#E4E9F2] bg-[#FFFFFF] text-[#141B2D] shadow-surface"
                      : "border border-transparent text-[#4E596E] hover:text-[#141B2D]",
                  )}
                >
                  Create Account
                </button>
              </div>
            )}

            {error ? <Alert tone="danger">{error}</Alert> : null}
            {infoMessage ? <Alert tone="success">{infoMessage}</Alert> : null}

            <div className="rounded-xl border border-[#E4E9F2] bg-[#FFFFFF] p-6 shadow-surface">
              {mode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" noValidate>
                  <Field
                    label="Work or personal email"
                    htmlFor="email"
                    error={loginForm.formState.errors.email?.message}
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      {...loginForm.register("email")}
                    />
                  </Field>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-xs font-semibold text-[#141B2D]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode("recovery")}
                        className="text-xs font-medium text-[#4263EB] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        className="pr-10"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68738A] hover:text-[#141B2D]"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password ? (
                      <p className="text-xs font-medium text-[#E5484D]" role="alert">
                        {loginForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={loginForm.formState.isSubmitting}
                  >
                    <KeyRound className="size-4" /> Sign in to workspace
                  </Button>

                  {!isSupabaseAuth ? (
                    <div className="border-t border-[#E4E9F2] pt-4">
                      <p className="mb-2.5 text-center text-xs font-medium text-[#68738A]">
                        Quick demo sign in
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoSign("requester")}
                        >
                          <Bot className="size-3.5 text-[#4263EB]" /> Demo Requester
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoSign("reviewer")}
                        >
                          <Code2 className="size-3.5 text-[#12A875]" /> Demo Specialist
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </form>
              ) : mode === "register" ? (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" noValidate>
                  <Field label="Full name" htmlFor="name" error={registerForm.formState.errors.name?.message}>
                    <Input
                      id="name"
                      placeholder="Ada Lovelace"
                      autoComplete="name"
                      {...registerForm.register("name")}
                    />
                  </Field>

                  <Field
                    label="Email address"
                    htmlFor="reg-email"
                    error={registerForm.formState.errors.email?.message}
                  >
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="ada@engineering.org"
                      autoComplete="email"
                      {...registerForm.register("email")}
                    />
                  </Field>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="text-xs font-semibold text-[#141B2D]">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        className="pr-10"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68738A] hover:text-[#141B2D]"
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[11px]">
                      <span className={cn("inline-flex items-center gap-1", hasMinLength ? "text-[#0B7D56] font-medium" : "text-[#68738A]")}>
                        <Check className="size-3" /> 8+ characters
                      </span>
                      <span className={cn("inline-flex items-center gap-1", hasLetter ? "text-[#0B7D56] font-medium" : "text-[#68738A]")}>
                        <Check className="size-3" /> 1+ letter
                      </span>
                      <span className={cn("inline-flex items-center gap-1", hasNumber ? "text-[#0B7D56] font-medium" : "text-[#68738A]")}>
                        <Check className="size-3" /> 1+ number
                      </span>
                    </div>
                    {registerForm.formState.errors.password ? (
                      <p className="text-xs font-medium text-[#E5484D]" role="alert">
                        {registerForm.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm-password" className="text-xs font-semibold text-[#141B2D]">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        className="pr-10"
                        {...registerForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#68738A] hover:text-[#141B2D]"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword ? (
                      <p className="text-xs font-medium text-[#E5484D]" role="alert">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Role selector: Requester or Reviewer (Specialist) — NO Admin role */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-semibold text-[#141B2D]">Account Role</span>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => registerForm.setValue("role", "REQUESTER", { shouldValidate: true })}
                        className={cn(
                          "flex flex-col items-start rounded-xl border p-3 text-left transition-colors",
                          selectedRole === "REQUESTER"
                            ? "border-[#4263EB] bg-[#4263EB]/[0.06] ring-1 ring-[#4263EB]/25"
                            : "border-[#E4E9F2] bg-[#FFFFFF] hover:border-[#CBD5E1]",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Bot className="size-4 text-[#4263EB]" />
                          {selectedRole === "REQUESTER" ? (
                            <CheckCircle2 className="size-4 text-[#4263EB]" />
                          ) : null}
                        </div>
                        <span className="mt-2 font-display text-xs font-bold text-[#141B2D]">Requester</span>
                        <span className="mt-0.5 text-[11px] leading-4 text-[#68738A]">
                          Escalate AI tasks &amp; fund reviews
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => registerForm.setValue("role", "REVIEWER", { shouldValidate: true })}
                        className={cn(
                          "flex flex-col items-start rounded-xl border p-3 text-left transition-colors",
                          selectedRole === "REVIEWER"
                            ? "border-[#12A875] bg-[#12A875]/[0.07] ring-1 ring-[#12A875]/25"
                            : "border-[#E4E9F2] bg-[#FFFFFF] hover:border-[#CBD5E1]",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Code2 className="size-4 text-[#12A875]" />
                          {selectedRole === "REVIEWER" ? (
                            <CheckCircle2 className="size-4 text-[#12A875]" />
                          ) : null}
                        </div>
                        <span className="mt-2 font-display text-xs font-bold text-[#141B2D]">
                          Reviewer (Specialist)
                        </span>
                        <span className="mt-0.5 text-[11px] leading-4 text-[#68738A]">
                          Certify skills &amp; solve escalations
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#4E596E]">
                      <input
                        type="checkbox"
                        {...registerForm.register("acceptTerms")}
                        className="mt-0.5 size-4 rounded border-[#CBD5E1] accent-[#4263EB]"
                      />
                      <span className="leading-5">
                        I accept the platform terms and acknowledge the{" "}
                        <Link to="/privacy" className="font-medium text-[#4263EB] underline underline-offset-2">
                          Data Governance Notice
                        </Link>
                        .
                      </span>
                    </label>
                    {registerForm.formState.errors.acceptTerms ? (
                      <p className="text-xs font-medium text-[#E5484D]" role="alert">
                        {registerForm.formState.errors.acceptTerms.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={registerForm.formState.isSubmitting}
                  >
                    <UserRound className="size-4" /> Create account
                  </Button>
                </form>
              ) : mode === "recovery" ? (
                <form onSubmit={recoveryForm.handleSubmit(onRecovery)} className="space-y-4" noValidate>
                  <Field
                    label="Account email address"
                    htmlFor="rec-email"
                    error={recoveryForm.formState.errors.email?.message}
                  >
                    <Input
                      id="rec-email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      {...recoveryForm.register("email")}
                    />
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={recoveryForm.formState.isSubmitting}
                  >
                    <Mail className="size-4" /> Send Recovery Link
                  </Button>

                  <div className="pt-1 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-semibold text-[#4263EB] hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              ) : mode === "update-password" ? (
                <form onSubmit={updatePasswordForm.handleSubmit(onUpdatePassword)} className="space-y-4" noValidate>
                  <Field
                    label="New password"
                    htmlFor="new-password"
                    error={updatePasswordForm.formState.errors.password?.message}
                  >
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      {...updatePasswordForm.register("password")}
                    />
                  </Field>

                  <Field
                    label="Confirm new password"
                    htmlFor="confirm-new-password"
                    error={updatePasswordForm.formState.errors.confirmPassword?.message}
                  >
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      {...updatePasswordForm.register("confirmPassword")}
                    />
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={updatePasswordForm.formState.isSubmitting}
                  >
                    <Lock className="size-4" /> Update Password
                  </Button>
                </form>
              ) : mode === "expired" ? (
                <div className="space-y-4 py-2 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#E5484D]/10 text-[#E5484D]">
                    <AlertTriangle className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-[#141B2D]">
                      Link is invalid or expired
                    </h3>
                    <p className="text-xs leading-5 text-[#68738A]">
                      Email confirmation and password recovery tokens expire after single use or timeout. Request a new
                      link below.
                    </p>
                  </div>
                  <div className="grid gap-2 pt-1">
                    <Button type="button" variant="default" onClick={() => switchMode("recovery")}>
                      Request Password Reset
                    </Button>
                    <Button type="button" variant="outline" onClick={() => switchMode("login")}>
                      Return to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#4263EB]/10 text-[#4263EB]">
                    <Mail className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-[#141B2D]">Verify your email address</h3>
                    <p className="text-xs leading-5 text-[#68738A]">
                      We dispatched a confirmation link to{" "}
                      <strong className="text-[#141B2D]">{pendingEmail || "your email address"}</strong>.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E4E9F2] bg-[#F5F7FC] p-3 text-left text-xs leading-5 text-[#4E596E]">
                    Open the confirmation link from your email inbox to activate your session, then sign in below.
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onResendVerification}
                      disabled={isResending || resendCooldown > 0 || !pendingEmail}
                    >
                      <RefreshCw className={cn("size-3.5", isResending && "animate-spin")} />
                      {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend Verification Email"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => switchMode("login")}>
                      Return to Sign In
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E4E9F2] pt-3 text-xs text-[#68738A]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#12A875]" /> Protected session authentication
              </span>
              <Link to="/app/docs" className="inline-flex items-center gap-1 font-medium text-[#4263EB] hover:underline">
                <Terminal className="size-3.5" /> API &amp; MCP Docs <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 text-center text-xs text-[#68738A] lg:px-10">
          By signing in or creating an account, you acknowledge the{" "}
          <Link to="/privacy" className="font-medium text-[#4263EB] underline underline-offset-2">
            Data Governance Notice
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
