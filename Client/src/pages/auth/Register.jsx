import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Hexagon,
} from "lucide-react";
import { registerApi } from "../../api/authApi";
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
import { Separator } from "../../components/ui/separator";

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const fieldClass = (hasError, withIcon = true) =>
  `h-10 w-full ${withIcon ? "pl-10" : ""} ${hasError ? "aria-invalid" : ""}`;

const errorClass = "mt-1.5 text-xs text-destructive";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values) => {
      setAuthError("");
      try {
        await registerApi({
          name: values.name,
          email: values.email,
          password: values.password,
        });

        showToast({
          type: "success",
          message: "Account created successfully",
        });
        navigate("/login", { replace: true });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "We couldn't create your account. Check your details and try again.";
        setAuthError(message);
        showToast({ type: "error", message });
      }
    },
  });

  const nameError = formik.submitCount > 0 && formik.errors.name;
  const emailError = formik.submitCount > 0 && formik.errors.email;
  const passwordError = formik.submitCount > 0 && formik.errors.password;
  const confirmError = formik.submitCount > 0 && formik.errors.confirmPassword;

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
        className="w-full max-w-2xl shadow-2xl animate-fade-in-up"
        style={{
          fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <CardContent className="p-8">
          <CardHeader className="flex flex-col items-center text-center mb-8 px-0">
            <Hexagon className="w-10 h-10 text-primary animate-fade-in-up animate-delay-100 cursor-pointer" strokeWidth={2.5} onClick={() => navigate("/")} />
            <span className="mt-3 text-xs tracking-[0.25em] uppercase text-primary animate-fade-in-up animate-delay-200">
              Grand Horizon Hotel
            </span>
            <CardTitle className="font-display text-3xl mt-4 animate-fade-in-up animate-delay-300">
              Create your account
            </CardTitle>
            <CardDescription className="animate-fade-in-up animate-delay-400">
              Join Grand Horizon and get started
            </CardDescription>
          </CardHeader>

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up animate-delay-100">
              <div className={`space-y-2 ${nameError ? "sm:col-span-2" : ""}`}>
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                    disabled={formik.isSubmitting}
                    placeholder="John Doe"
                    aria-invalid={nameError || undefined}
                    className={fieldClass(nameError)}
                  />
                </div>
                {nameError && (
                  <p className={errorClass}>{formik.errors.name}</p>
                )}
              </div>

              <div className={`space-y-2 ${emailError ? "sm:col-span-2" : ""}`}>
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    disabled={formik.isSubmitting}
                    placeholder="johndoe@gmail.com"
                    aria-invalid={emailError || undefined}
                    className={fieldClass(emailError)}
                  />
                </div>
                {emailError && (
                  <p className={errorClass}>{formik.errors.email}</p>
                )}
              </div>

              <div
                className={`space-y-2 ${passwordError ? "sm:col-span-2" : ""}`}
              >
                <Label htmlFor="password">Password</Label>
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

              <div
                className={`space-y-2 ${confirmError ? "sm:col-span-2" : ""}`}
              >
                <Label htmlFor="confirmPassword">Confirm password</Label>
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
                </div>
                {confirmError && (
                  <p className={errorClass}>{formik.errors.confirmPassword}</p>
                )}
              </div>
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
              className="w-full uppercase tracking-wider animate-fade-in-up animate-delay-200"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                "Creating account…"
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 mt-6">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              or continue with
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full mt-5 h-auto py-3 animate-fade-in-up animate-delay-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign up with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up animate-delay-400">
            Already have an account?{" "}
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
};

export default Register;
