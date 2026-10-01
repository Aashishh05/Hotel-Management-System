import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Lock, Eye, EyeOff, ArrowRight, Hexagon, ShieldCheck } from "lucide-react";
import { resetPasswordApi } from "../../api/authApi";
import { showToast } from "../../components/common/Toast";
import ThemeToggle from "../../components/common/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const fieldClass = (hasError) =>
  `pl-10 pr-10 h-10 w-full ${hasError ? "aria-invalid" : ""}`;

const errorClass = "mt-1.5 text-xs text-destructive";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values) => {
      setAuthError("");
      try {
        const res = await resetPasswordApi(token, values.password);

        showToast({
          type: "success",
          message: res?.message || "Password reset successfully.",
        });

        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "We couldn't reset your password. The link may have expired.";
        setAuthError(message);
        showToast({ type: "error", message });
      }
    },
  });

  const passwordError = formik.submitCount > 0 && formik.errors.password;
  const confirmError = formik.submitCount > 0 && formik.errors.confirmPassword;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
          .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        `}</style>

        <Card
          className="w-full max-w-md shadow-2xl animate-fade-in-up"
          style={{
            fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <CardContent className="p-8">
            <CardHeader className="flex flex-col items-center text-center mb-6 px-0">
              <Hexagon
                className="w-10 h-10 text-primary"
                strokeWidth={2.5}
              />
              <span className="mt-3 text-xs tracking-[0.25em] uppercase text-primary">
                Grand Horizon Hotel
              </span>
              <CardTitle className="font-display text-3xl mt-4">
                Invalid reset link
              </CardTitle>
              <CardDescription>
                This password reset link is missing or malformed
              </CardDescription>
            </CardHeader>

            <Link to="/forgot-password">
              <Button
                type="button"
                size="lg"
                className="w-full uppercase tracking-wider"
              >
                Request a new link
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have a password?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <Card
        className="w-full max-w-md shadow-2xl animate-fade-in-up"
        style={{
          fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <CardContent className="p-8">
          <CardHeader className="flex flex-col items-center text-center mb-8 px-0">
            <Hexagon
              className="w-10 h-10 text-primary animate-fade-in-up animate-delay-100 cursor-pointer"
              onClick={() => navigate("/")}
              strokeWidth={2.5}
            />
            <span className="mt-3 text-xs tracking-[0.25em] uppercase text-primary animate-fade-in-up animate-delay-200">
              Grand Horizon Hotel
            </span>
            <CardTitle className="font-display text-3xl mt-4 animate-fade-in-up animate-delay-300">
              Choose a new password
            </CardTitle>
            <CardDescription className="animate-fade-in-up animate-delay-400">
              Pick something strong you haven&apos;t used before
            </CardDescription>
          </CardHeader>

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2 animate-fade-in-up animate-delay-100">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  disabled={formik.isSubmitting}
                  placeholder="••••••••"
                  aria-invalid={passwordError || undefined}
                  className={fieldClass(passwordError)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={formik.isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <p className={errorClass}>{formik.errors.password}</p>
              )}
            </div>

            <div className="space-y-2 animate-fade-in-up animate-delay-200">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  disabled={formik.isSubmitting}
                  placeholder="••••••••"
                  aria-invalid={confirmError || undefined}
                  className={fieldClass(confirmError)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={formik.isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {confirmError && (
                <p className={errorClass}>{formik.errors.confirmPassword}</p>
              )}
            </div>

            {authError && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-2.5"
              >
                {authError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 uppercase tracking-wider animate-fade-in-up animate-delay-300"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                "Updating password…"
              ) : (
                <>
                  Reset password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3.5 animate-fade-in-up animate-delay-400">
            <ShieldCheck
              className="mt-0.5 w-4 h-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              You&apos;ll be signed out everywhere and will need to sign in with
              your new password.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up animate-delay-400">
            Remembered it?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 transition-colors hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
