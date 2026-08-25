"use client";

import { useState, useEffect } from "react";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, X, Search, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { validatePhone } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { EASING } from "@/lib/motion-presets";

// ── Schemas ──
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine(validatePhone, "Please enter a valid phone number"),
    password: z.string().min(9, "Password must be at least 9 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// ── Input Field ──
function Field({
  label,
  id,
  type = "text",
  placeholder,
  error,
  register,
  autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegisterReturn;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#934462]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-2xl border-[1.5px] border-[#d8c1c6] bg-white/80 px-4 text-sm font-medium text-[#1d1b1b] outline-none transition-all duration-200 placeholder:text-[#857277] focus:border-[#934462] focus:bg-white focus:ring-4 focus:ring-[#934462]/15"
        {...register}
      />
      {error && <p className="text-xs font-medium text-[#D32F2F]">{error}</p>}
    </div>
  );
}

// ── Main Drawer ──
export function AuthDrawer() {
  const {
    authDrawerOpen,
    authDrawerMode,
    closeAuthDrawer,
    openAuthDrawer,
    login,
    register,
  } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");

  const signInForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const {
    handleSubmit: handleSignIn,
    formState: { errors: signInErrors, isSubmitting: signingIn },
  } = signInForm;

  const regForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const {
    handleSubmit: handleRegister,
    formState: { errors: regErrors, isSubmitting: registering },
  } = regForm;

  const onSignIn = async (data: LoginFormData) => {
    setServerError("");
    const r = await login(data.email, data.password);
    if (!r.success) setServerError(r.error || "Login failed.");
  };

  const onRegister = async (data: RegisterFormData) => {
    setServerError("");
    const r = await register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    if (!r.success) setServerError(r.error || "Registration failed.");
  };

  const switchTab = (mode: "signin" | "register") => {
    setServerError("");
    openAuthDrawer(mode);
  };

  // ESC & scroll lock
  useEffect(() => {
    if (!authDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authDrawerOpen, closeAuthDrawer]);

  useEffect(() => {
    document.body.style.overflow = authDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [authDrawerOpen]);

  if (!authDrawerOpen) return null;

  const isSignIn = authDrawerMode === "signin";
  const activeIndex = isSignIn ? 0 : 1;

  // ── Motion variants ──
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const drawerVariants: Variants = {
    hidden: { x: "100%", opacity: 0.4 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    },
    exit: {
      x: "100%",
      opacity: 0.4,
      transition: { duration: 0.25, ease: "easeIn" },
    },
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, x: 16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, ease: EASING.bladeIn },
    },
    exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {authDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(74,44,42,0.35)] backdrop-blur-sm cursor-pointer"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeAuthDrawer}
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-drawer-title"
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col overflow-hidden rounded-l-[2rem] border-l border-white/30",
              "bg-[#fef8f8]/90 backdrop-blur-xl",
              "shadow-[0_20px_40px_rgba(147,68,98,0.1)]",
            )}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top candy stripe */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9dbe] to-[#ffdad6]" />

            {/* Close button */}
            <button
              onClick={closeAuthDrawer}
              className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full 
             text-[#534347] transition-all duration-1000 ease-in-out
             hover:scale-110 hover:rotate-[360deg] hover:bg-[#f2eced] hover:text-[#934462]
             active:scale-90"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-full flex-col gap-8 px-8 pb-8 pt-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff9dbe] text-[#7b304d] shadow-[0_10px_30px_-10px_rgba(255,157,190,0.5)]">
                  <Shield className="h-5 w-5 text-[#FFF0F5]" />
                </div>
                <div>
                  <p
                    id="auth-drawer-title"
                    className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#934462]"
                  >
                    KOI <span className="text-[#FF6B8A]">🍭</span>
                  </p>
                  <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#934462]">
                    Consumer Account
                  </p>
                </div>
              </div>

              {/* ─── 滑块 Tab ─── */}
              <div className="relative flex rounded-full bg-[#e7e1e1] p-1 shadow-inner">
                <motion.div
                  className="absolute left-0 top-0 h-full w-1/2 rounded-full bg-[#934462] shadow-[0_10px_30px_-10px_rgba(255,157,190,0.5)]"
                  animate={{ x: activeIndex === 0 ? "0%" : "100%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  style={{ pointerEvents: "none" }}
                />
                {(["signin", "register"] as const).map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab)}
                    className={cn(
                      "relative z-10 flex-1 cursor-pointer rounded-full px-8 py-2 text-center text-sm font-medium transition-colors duration-300",
                      activeIndex === index
                        ? "text-white"
                        : "text-[#534347] hover:text-[#934462]",
                    )}
                  >
                    {tab === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="rounded-2xl border border-[#ff9dbe]/40 bg-white/70 p-4 text-sm text-[#ba1a1a] shadow-sm">
                  {serverError}
                </div>
              )}

              {/* Form container —— 添加 scrollbar-gutter:stable 避免滚动条跳动 */}
              <div className="flex-1 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                <AnimatePresence mode="wait">
                  {isSignIn ? (
                    <motion.form
                      key="signin"
                      onSubmit={handleSignIn(onSignIn)}
                      className="space-y-4"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Field
                        label="Email Address"
                        id="sd-email"
                        type="email"
                        placeholder="your@email.com"
                        error={signInErrors.email?.message}
                        register={signInForm.register("email")}
                        autoComplete="email"
                      />
                      <div className="space-y-1.5">
                        <label
                          htmlFor="sd-pw"
                          className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#934462]"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="sd-pw"
                            type={showPw ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="h-12 w-full rounded-2xl border-[1.5px] border-[#d8c1c6] bg-white/80 pl-4 pr-12 text-sm font-medium text-[#1d1b1b] outline-none transition-all duration-200 placeholder:text-[#857277] focus:border-[#934462] focus:bg-white focus:ring-4 focus:ring-[#934462]/15"
                            {...signInForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#534347] transition-colors hover:text-[#934462]"
                          >
                            {showPw ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {signInErrors.password && (
                          <p className="text-xs font-medium text-[#D32F2F]">
                            {signInErrors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Sign In 按钮 */}
                      <button
                        type="submit"
                        disabled={signingIn}
                        className="group relative h-14 w-full overflow-hidden rounded-full border border-[#c87495] bg-[linear-gradient(180deg,#ffb6cf_0%,#ff9dbe_42%,#f58db1_100%)] px-6 text-base font-bold text-[#7b304d] shadow-[0_12px_0_#c87495,0_16px_30px_-8px_rgba(150,63,92,0.42),inset_0_1px_0_rgba(255,255,255,0.58)] transition-transform duration-200 animate-gradient-flow hover:scale-[1.02] hover:shadow-[0_12px_0_#c87495,0_18px_34px_-6px_rgba(150,63,92,0.48),inset_0_1px_0_rgba(255,255,255,0.64)] active:translate-y-[1px] active:shadow-[0_10px_0_#c87495,0_12px_24px_-10px_rgba(150,63,92,0.4),inset_0_1px_0_rgba(255,255,255,0.45)] disabled:pointer-events-none disabled:opacity-60"
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.45)_22%,rgba(255,255,255,0.08)_34%,transparent_48%)] bg-[length:220%_100%] animate-button-sheen"
                        />
                        <span className="relative z-10 inline-flex items-center gap-2">
                          {signingIn ? "Signing In..." : "Sign In"}
                        </span>
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      onSubmit={handleRegister(onRegister)}
                      className="space-y-4"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Field
                        label="Full Name"
                        id="sd-name"
                        placeholder="Your full name"
                        error={regErrors.name?.message}
                        register={regForm.register("name")}
                        autoComplete="name"
                      />
                      <Field
                        label="Email Address"
                        id="sd-remail"
                        type="email"
                        placeholder="your@email.com"
                        error={regErrors.email?.message}
                        register={regForm.register("email")}
                        autoComplete="email"
                      />
                      <Field
                        label="Phone Number"
                        id="sd-phone"
                        type="tel"
                        placeholder="13812341234"
                        error={regErrors.phone?.message}
                        register={regForm.register("phone")}
                        autoComplete="tel"
                      />
                      <div className="space-y-1.5">
                        <label
                          htmlFor="sd-rpw"
                          className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#934462]"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="sd-rpw"
                            type={showPw ? "text" : "password"}
                            placeholder="At least 9 characters"
                            autoComplete="new-password"
                            className="h-12 w-full rounded-2xl border-[1.5px] border-[#d8c1c6] bg-white/80 pl-4 pr-12 text-sm font-medium text-[#1d1b1b] outline-none transition-all duration-200 placeholder:text-[#857277] focus:border-[#934462] focus:bg-white focus:ring-4 focus:ring-[#934462]/15"
                            {...regForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#534347] transition-colors hover:text-[#934462]"
                          >
                            {showPw ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {regErrors.password && (
                          <p className="text-xs font-medium text-[#D32F2F]">
                            {regErrors.password.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="sd-cpw"
                          className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#934462]"
                        >
                          Confirm Password
                        </label>
                        <input
                          id="sd-cpw"
                          type="password"
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          className="h-12 w-full rounded-2xl border-[1.5px] border-[#d8c1c6] bg-white/80 px-4 text-sm font-medium text-[#1d1b1b] outline-none transition-all duration-200 placeholder:text-[#857277] focus:border-[#934462] focus:bg-white focus:ring-4 focus:ring-[#934462]/15"
                          {...regForm.register("confirmPassword")}
                        />
                        {regErrors.confirmPassword && (
                          <p className="text-xs font-medium text-[#D32F2F]">
                            {regErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Create Account 按钮 —— 修复为与登录按钮一致的糖果色流光风格 */}
                      <button
                        type="submit"
                        disabled={registering}
                        className="group relative h-14 w-full overflow-hidden rounded-full border border-[#c87495] bg-[linear-gradient(180deg,#ffb6cf_0%,#ff9dbe_42%,#f58db1_100%)] px-6 text-base font-bold text-[#7b304d] shadow-[0_12px_0_#c87495,0_16px_30px_-8px_rgba(150,63,92,0.42),inset_0_1px_0_rgba(255,255,255,0.58)] transition-transform duration-200 animate-gradient-flow hover:scale-[1.02] hover:shadow-[0_12px_0_#c87495,0_18px_34px_-6px_rgba(150,63,92,0.48),inset_0_1px_0_rgba(255,255,255,0.64)] active:translate-y-[1px] active:shadow-[0_10px_0_#c87495,0_12px_24px_-10px_rgba(150,63,92,0.4),inset_0_1px_0_rgba(255,255,255,0.45)] disabled:pointer-events-none disabled:opacity-60"
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.45)_22%,rgba(255,255,255,0.08)_34%,transparent_48%)] bg-[length:220%_100%] animate-button-sheen"
                        />
                        <span className="relative z-10 inline-flex items-center gap-2">
                          {registering
                            ? "Creating Account..."
                            : "Create Account"}
                        </span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Guest lookup */}
              <div className="mt-auto border-t border-[#d8c1c6]/30 pt-8 text-center">
                <Link
                  href="/lookup"
                  onClick={closeAuthDrawer}
                  className="mx-auto inline-flex items-center gap-2 text-sm font-medium text-[#1d1b1b] transition-colors hover:text-[#934462]"
                >
                  <Search className="h-4 w-4" />
                  Check Status Without Account
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
