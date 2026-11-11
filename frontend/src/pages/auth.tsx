import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "@/components/layout/public-layout";
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
    confirmPassword: z.string().min(1, "Confirm your password."),
    role: z.enum(["REQUESTER", "REVIEWER"]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Please agree to the terms to create your account.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const recoverySchema = z.object({
  email: z.string().trim().email("Enter the email address for your account."),
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

function friendlyAuthError(
  err: unknown,
  context: "login" | "register" | "recovery" | "update" | "resend",
): string {
  const code = err instanceof ApiError ? err.code?.toUpperCase() ?? "" : "";
  const raw = (err instanceof Error ? err.message : "").toLowerCase();

  if (code === "EMAIL_NOT_VERIFIED" || raw.includes("not confirmed") || raw.includes("verify your email")) {
    return "Please verify your email before signing in.";
  }
  if (
    code === "INVALID_CREDENTIALS" ||
    raw.includes("invalid login") ||
    raw.includes("invalid email or password") ||
    raw.includes("email or password is incorrect")
  ) {
    return "Your email or password is incorrect.";
  }
  if (
    code === "SESSION_EXPIRED" ||
    code === "UNAUTHENTICATED" ||
    raw.includes("session") ||
    raw.includes("expired") ||
    raw.includes("jwt")
  ) {
    return "Your session has expired. Please sign in again.";
  }
  if (code === "CONFLICT" || raw.includes("already registered") || raw.includes("already exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (context === "login") return "We couldn't sign you in. Please try again.";
  if (context === "register") return "We couldn't create your account. Please check your details and try again.";
  if (context === "recovery") return "We couldn't send a password reset link right now. Please try again.";
  if (context === "update") return "We couldn't update your password. Please request a new reset link.";
  return "We couldn't resend the verification email right now. Please try again.";
}

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
      setError("This link is invalid or has expired. Please request a new one below.");
      return;
    }
    if (params.get("verified") === "1" || (location.hash.includes("access_token") && !hasRecoveryToken)) {
      setInfoMessage("Email verified. You can now sign in to your account.");
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
      acceptTerms: false,
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
        setError("Please verify your email before signing in.");
      } else {
        setError(friendlyAuthError(err, "login"));
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
        setInfoMessage(`We sent a confirmation email to ${values.email}. Open the link inside to finish setting up your account.`);
      } else if (result.user) {
        if (result.user.role === "REVIEWER") {
          navigate("/app/onboarding/skills", { replace: true });
        } else {
          navigate("/app", { replace: true });
        }
      }
    } catch (err: unknown) {
      setError(friendlyAuthError(err, "register"));
    }
  }

  async function onResendVerification() {
    if (!pendingEmail) return;
    setIsResending(true);
    setError(null);
    try {
      await resendVerification(pendingEmail);
      setInfoMessage(`Verification email sent again to ${pendingEmail}.`);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(friendlyAuthError(err, "resend"));
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
      setError(friendlyAuthError(err, "recovery"));
    }
  }

  async function onUpdatePassword(values: UpdatePasswordValues) {
    setError(null);
    try {
      await updatePassword(values.password);
      setInfoMessage("Password updated. You can sign in now.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setError(friendlyAuthError(err, "update"));
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#F7F5EF] text-[#202722]">
      <header className="border-b border-[#E5E1D7] bg-[#FFFEFA]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#69736D] transition-colors hover:bg-[#F0EEE7] hover:text-[#202722]"
          >
            <ArrowLeft className="size-3.5" /> Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-1.5 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#202722] sm:text-[28px]">
              {mode === "login"
                ? "Welcome back"
                : mode === "register"
                  ? "Create your account"
                  : mode === "recovery"
                    ? "Reset your password"
                    : mode === "update-password"
                      ? "Set a new password"
                      : mode === "expired"
                        ? "This link has expired"
                        : "Check your inbox"}
            </h1>
            <p className="text-sm leading-6 text-[#69736D]">
              {mode === "login"
                ? "Sign in to manage your tasks, review progress, and check results."
                : mode === "register"
                  ? "Get started sharing tasks or completing work matched to your skills."
                  : mode === "recovery"
                    ? "Enter your email address and we will send you a reset link."
                    : mode === "update-password"
                      ? "Enter and confirm your new password below."
                      : mode === "expired"
                        ? "For your security, confirmation and reset links expire after one use. Request a fresh link below."
                        : "Open the confirmation link in your email to finish creating your account."}
            </p>
          </div>

          {error ? <Alert tone="danger">{error}</Alert> : null}
          {infoMessage ? <Alert tone="success">{infoMessage}</Alert> : null}

          <div className="rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] p-6 shadow-surface sm:p-7">
            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" noValidate>
                <Field
                  label="Email address"
                  htmlFor="email"
                  error={loginForm.formState.errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...loginForm.register("email")}
                  />
                </Field>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-semibold text-[#202722]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("recovery")}
                      className="text-xs font-medium text-[#365FEA] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="pr-10"
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#69736D] hover:text-[#202722]"
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
                  Sign in
                </Button>

                <div className="border-t border-[#E5E1D7] pt-4 text-center text-xs text-[#69736D]">
                  New to TrustToPay?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-[#365FEA] hover:underline"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            ) : mode === "register" ? (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" noValidate>
                <Field label="Full name" htmlFor="name" error={registerForm.formState.errors.name?.message}>
                  <Input
                    id="name"
                    placeholder="Alex Morgan"
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
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...registerForm.register("email")}
                  />
                </Field>

                <div className="space-y-1.5">
                  <label htmlFor="reg-password" className="text-xs font-semibold text-[#202722]">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="pr-10"
                      {...registerForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#69736D] hover:text-[#202722]"
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[11px]">
                    <span className={cn("inline-flex items-center gap-1", hasMinLength ? "font-medium text-[#438866]" : "text-[#69736D]")}>
                      <Check className="size-3" /> 8+ characters
                    </span>
                    <span className={cn("inline-flex items-center gap-1", hasLetter ? "font-medium text-[#438866]" : "text-[#69736D]")}>
                      <Check className="size-3" /> 1+ letter
                    </span>
                    <span className={cn("inline-flex items-center gap-1", hasNumber ? "font-medium text-[#438866]" : "text-[#69736D]")}>
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
                  <label htmlFor="confirm-password" className="text-xs font-semibold text-[#202722]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="pr-10"
                      {...registerForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#69736D] hover:text-[#202722]"
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

                <div className="space-y-2 pt-1">
                  <span className="block text-xs font-semibold text-[#202722]">
                    Choose how you will use TrustToPay:
                  </span>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => registerForm.setValue("role", "REQUESTER", { shouldValidate: true })}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-3 text-left transition-colors",
                        selectedRole === "REQUESTER"
                          ? "border-[#365FEA] bg-[#365FEA]/[0.06] ring-1 ring-[#365FEA]/25"
                          : "border-[#E5E1D7] bg-[#FFFEFA] hover:border-[#D4CFC3]",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <UserRound className="size-4 text-[#365FEA]" />
                        {selectedRole === "REQUESTER" ? (
                          <CheckCircle2 className="size-4 text-[#365FEA]" />
                        ) : null}
                      </div>
                      <span className="mt-2 font-display text-xs font-bold text-[#202722]">
                        I need work completed
                      </span>
                      <span className="mt-0.5 text-[11px] leading-4 text-[#69736D]">
                        Share tasks and get checked results
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => registerForm.setValue("role", "REVIEWER", { shouldValidate: true })}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-3 text-left transition-colors",
                        selectedRole === "REVIEWER"
                          ? "border-[#438866] bg-[#438866]/[0.07] ring-1 ring-[#438866]/25"
                          : "border-[#E5E1D7] bg-[#FFFEFA] hover:border-[#D4CFC3]",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <BriefcaseBusiness className="size-4 text-[#438866]" />
                        {selectedRole === "REVIEWER" ? (
                          <CheckCircle2 className="size-4 text-[#438866]" />
                        ) : null}
                      </div>
                      <span className="mt-2 font-display text-xs font-bold text-[#202722]">
                        I want to offer my expertise
                      </span>
                      <span className="mt-0.5 text-[11px] leading-4 text-[#69736D]">
                        Complete tasks matched to your skills
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#69736D]">
                    <input
                      type="checkbox"
                      {...registerForm.register("acceptTerms")}
                      className="mt-0.5 size-4 rounded border-[#D4CFC3] accent-[#365FEA]"
                    />
                    <span className="leading-5">
                      Agree to terms and review our{" "}
                      <Link to="/privacy" className="font-medium text-[#365FEA] underline underline-offset-2">
                        Privacy Notice
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
                  Create account
                </Button>

                <div className="border-t border-[#E5E1D7] pt-4 text-center text-xs text-[#69736D]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-[#365FEA] hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            ) : mode === "recovery" ? (
              <form onSubmit={recoveryForm.handleSubmit(onRecovery)} className="space-y-4" noValidate>
                <Field
                  label="Email address"
                  htmlFor="rec-email"
                  error={recoveryForm.formState.errors.email?.message}
                >
                  <Input
                    id="rec-email"
                    type="email"
                    placeholder="you@example.com"
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
                  <Mail className="size-4" /> Send reset link
                </Button>

                <div className="pt-1 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-[#365FEA] hover:underline"
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
                  <Lock className="size-4" /> Update password
                </Button>
              </form>
            ) : mode === "expired" ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#E5484D]/10 text-[#E5484D]">
                  <AlertTriangle className="size-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-base font-bold text-[#202722]">
                    Link expired or already used
                  </h2>
                  <p className="text-xs leading-5 text-[#69736D]">
                    Request a fresh password reset link below to continue.
                  </p>
                </div>
                <div className="grid gap-2 pt-1">
                  <Button type="button" variant="default" onClick={() => switchMode("recovery")}>
                    Send a new reset link
                  </Button>
                  <Button type="button" variant="outline" onClick={() => switchMode("login")}>
                    Back to sign in
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#365FEA]/10 text-[#365FEA]">
                  <Mail className="size-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-base font-bold text-[#202722]">Verify your email</h2>
                  <p className="text-xs leading-5 text-[#69736D]">
                    We sent a confirmation link to{" "}
                    <strong className="text-[#202722]">{pendingEmail || "your email address"}</strong>.
                  </p>
                </div>
                <div className="rounded-lg border border-[#E5E1D7] bg-[#F0EEE7] p-3 text-left text-xs leading-5 text-[#69736D]">
                  Click the link in your email to confirm your account, then return here to sign in.
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onResendVerification}
                    disabled={isResending || resendCooldown > 0 || !pendingEmail}
                  >
                    <RefreshCw className={cn("size-3.5", isResending && "animate-spin")} />
                    {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend verification email"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => switchMode("login")}>
                    Back to sign in
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
