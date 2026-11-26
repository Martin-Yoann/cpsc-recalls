"use client";
import { useI18n } from "@/lib/i18n/provider";


import { useState, useEffect } from "react";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, X, Search, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { validatePhone } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";

// ─── Schemas ───
const loginSchema = z.object({
  email: z.string().min(1, "ui.email.is.required.4da1d5").email("ui.invalid.email.format.789ec2"),
  password: z.string().min(1, "ui.password.is.required.6c56a9"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "ui.name.is.required.222c72").min(2, "ui.name.must.be.at.least.2.characters.0acc3f"),
    email: z.string().min(1, "ui.email.is.required.4da1d5").email("ui.invalid.email.format.789ec2"),
    phone: z.string().min(1, "ui.phone.number.is.required.f84537").refine(validatePhone, "ui.please.enter.a.valid.phone.number.4986d6"),
    password: z.string().min(6, "ui.password.must.be.at.least.6.characters.c01752"),
    confirmPassword: z.string().min(1, "ui.please.confirm.your.password.51d69a"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Input Field ───
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
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-foreground mb-1.5">
        {t(label)}
      </label>
      <input
        id={id}
        type={type}
        placeholder={t(placeholder)}
        autoComplete={autoComplete}
        className={cn(
          "h-10 w-full px-3 border bg-white text-sm rounded-md outline-none transition-colors",
          "border-border text-foreground placeholder:text-secondary",
          "focus:border-foreground focus:ring-1 focus:ring-foreground",
          error && "border-brand"
        )}
        {...register}
      />
      {error && <p className="mt-1 text-xs text-brand">{t(error)}</p>}
    </div>
  );
}

export function AuthDrawer() {
  const { t } = useI18n();
  const { authDrawerOpen, authDrawerMode, closeAuthDrawer, openAuthDrawer, login, register } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");

  const signInForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const { handleSubmit: handleSignIn, formState: { errors: signInErrors, isSubmitting: signingIn } } = signInForm;

  const regForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });
  const { handleSubmit: handleRegister, formState: { errors: regErrors, isSubmitting: registering } } = regForm;

  const onSignIn = async (data: LoginFormData) => {
    setServerError("");
    const r = await login(data.email, data.password);
    if (!r.success) setServerError(r.error || "ui.login.failed.244ad5");
  };

  const onRegister = async (data: RegisterFormData) => {
    setServerError("");
    const r = await register({ name: data.name, email: data.email, phone: data.phone, password: data.password });
    if (!r.success) setServerError(r.error || "ui.registration.failed.4ea79f");
  };

  const switchTab = (mode: "signin" | "register") => {
    setServerError("");
    openAuthDrawer(mode);
  };

  useEffect(() => {
    if (!authDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAuthDrawer(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [authDrawerOpen, closeAuthDrawer]);

  useEffect(() => {
    document.body.style.overflow = authDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [authDrawerOpen]);

  if (!authDrawerOpen) return null;

  const isSignIn = authDrawerMode === "signin";
  const activeIndex = isSignIn ? 0 : 1;

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const drawerVariants: Variants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", damping: 30, stiffness: 280 } },
    exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  return (
    <AnimatePresence>
      {authDrawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm cursor-pointer"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeAuthDrawer}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-drawer-title"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center bg-foreground text-white rounded-md">
                  <Shield className="h-4 w-4" />
                </span>
                <div>
                  <p id="auth-drawer-title" className="text-base font-bold text-foreground">{t("ui.koi.recall.ccd6c2")}</p>
                  <p className="label-eyebrow !text-[10px]">{t("ui.consumer.account.cb1d64")}</p>
                </div>
              </div>
              <button
                onClick={closeAuthDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-surface-dim transition-colors"
                aria-label={t("ui.close.bbfa77")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs — sliding pill */}
            <div className="px-6 pt-5">
              <div className="relative flex rounded-lg bg-surface-dim p-1">
                <motion.div
                  className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-foreground shadow-sm"
                  animate={{ x: activeIndex === 0 ? "0%" : "100%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
                {(["signin", "register"] as const).map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => switchTab(tab)}
                    className={cn(
                      "relative h-8 z-10 flex-1 py-2.5 text-sm font-semibold transition-colors rounded-md",
                      activeIndex === index ? "text-white" : "text-secondary hover:text-foreground"
                    )}
                  >
                    {t(tab === "signin" ? "auth.signIn" : "ui.create.account.eff4fd")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {serverError && (
                <div className="mb-4 rounded-md border border-brand/20 bg-brand-light p-3 text-sm text-brand">
                  {t(serverError)}
                </div>
              )}

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
                      label={t("ui.email.address.09ba55")}
                      id="sd-email"
                      type="email"
                      placeholder="your@email.com"
                      error={signInErrors.email?.message}
                      register={signInForm.register("email")}
                      autoComplete="email"
                    />
                    <div>
                      <label htmlFor="sd-pw" className="block text-xs font-semibold text-foreground mb-1.5">
                        {t("ui.password.8be3c9")}</label>
                      <div className="relative">
                        <input
                          id="sd-pw"
                          type={showPw ? "text" : "password"}
                          placeholder={t("ui.enter.your.password.137816")}
                          autoComplete="current-password"
                          className={cn(
                            "h-10 w-full px-3 pr-10 border bg-white text-sm rounded-md outline-none transition-colors",
                            "border-border text-foreground placeholder:text-secondary",
                            "focus:border-foreground focus:ring-1 focus:ring-foreground",
                            signInErrors.password && "border-brand"
                          )}
                          {...signInForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary hover:text-foreground transition-colors"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signInErrors.password && <p className="mt-1 text-xs text-brand">{t(signInErrors.password.message)}</p>}
                    </div>

                    <button
                      type="submit"
                      style={{ 
                        transition: "all 0.2s ease-in-out",
                        border: "1px solid #AFA3A3",
                        background: "#3f3f3f",
                        color: "white",
                        fontWeight: "bold"
                       }}
                      disabled={signingIn}
                      className="btn-brand w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed h-11"
                    >
                      {signingIn ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("ui.signing.in.ad53ee")}</> : t("auth.signIn")}
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
                      label={t("ui.full.name.64346b")}
                      id="sd-name"
                      placeholder={t("ui.your.full.name.d90476")}
                      error={regErrors.name?.message}
                      register={regForm.register("name")}
                      autoComplete="name"
                    />
                    <Field
                      label={t("ui.email.address.09ba55")}
                      id="sd-remail"
                      type="email"
                      placeholder="your@email.com"
                      error={regErrors.email?.message}
                      register={regForm.register("email")}
                      autoComplete="email"
                    />
                    <Field
                      label={t("ui.phone.number.ab25d6")}
                      id="sd-phone"
                      type="tel"
                      placeholder="13812341234"
                      error={regErrors.phone?.message}
                      register={regForm.register("phone")}
                      autoComplete="tel"
                    />
                    <div>
                      <label htmlFor="sd-rpw" className="block text-xs font-semibold text-foreground mb-1.5">
                        {t("ui.password.8be3c9")}</label>
                      <div className="relative">
                        <input
                          id="sd-rpw"
                          type={showPw ? "text" : "password"}
                          placeholder={t("ui.at.least.6.characters.d5af56")}
                          autoComplete="new-password"
                          className={cn(
                            "h-10 w-full px-3 pr-10 border bg-white text-sm rounded-md outline-none transition-colors",
                            "border-border text-foreground placeholder:text-secondary",
                            "focus:border-foreground focus:ring-1 focus:ring-foreground",
                            regErrors.password && "border-brand"
                          )}
                          {...regForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary hover:text-foreground transition-colors"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {regErrors.password && <p className="mt-1 text-xs text-brand">{t(regErrors.password.message)}</p>}
                    </div>
                    <Field
                      label={t("ui.confirm.password.c2d404")}
                      id="sd-cpw"
                      type="password"
                      placeholder={t("ui.re.enter.your.password.e76472")}
                      error={regErrors.confirmPassword?.message}
                      register={regForm.register("confirmPassword")}
                      autoComplete="new-password"
                    />

                    <button
                      type="submit"
                      disabled={registering}
                      style={{ 
                        transition: "all 0.2s ease-in-out",
                        border: "1px solid #AFA3A3",
                        background: "#3f3f3f",
                        color: "white",
                        fontWeight: "bold"
                       }}
                      className="btn-brand w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed h-11"
                    >
                      {registering ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("ui.creating.account.a48e84")}</> : t("ui.create.account.eff4fd")}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4">
              <Link
                href="/lookup"
                onClick={closeAuthDrawer}
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-foreground transition-colors"
              >
                <Search className="h-4 w-4" />
                {t("ui.check.status.without.an.account.68a04b")}</Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
