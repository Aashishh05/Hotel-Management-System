import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Hexagon,
  MailCheck,
  KeyRound,
} from "lucide-react";
import { showToast } from "../../components/common/Toast";
import { forgotPasswordApi } from "../../api/authApi";
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
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

const fieldClass = (hasError) =>
  `pl-10 h-10 w-full ${hasError ? "aria-invalid" : ""}`;

const errorClass = "mt-1.5 text-xs text-destructive";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState("");
  const [authError, setAuthError] = useState("");

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      setAuthError("");
      try {
        const res = await forgotPasswordApi(values.email);

        setSentTo(values.email);
        showToast({
          type: "success",
          message: res?.message || "Reset link sent. Please check your inbox.",
        });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "We couldn't send the reset link. Please try again.";
        setAuthError(message);
        showToast({ type: "error", message });
      }
    },
  });

  const emailError = formik.submitCount > 0 && formik.errors.email;

  if (sentTo) {
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
              <MailCheck
                className="w-10 h-10 text-primary animate-fade-in-up animate-delay-100"
                strokeWidth={2.5}
              />
              <span className="mt-3 text-xs tracking-[0.25em] uppercase text-primary animate-fade-in-up animate-delay-200">
                Grand Horizon Hotel
              </span>
              <CardTitle className="font-display text-3xl mt-4 animate-fade-in-up animate-delay-300">
                Check your email
              </CardTitle>
              <CardDescription className="animate-fade-in-up animate-delay-400">
                We sent a password reset link to
              </CardDescription>
            </CardHeader>

            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3.5 text-center animate-fade-in-up animate-delay-300">
              <p className="break-all text-sm font-medium text-foreground">
                {sentTo}
              </p>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground animate-fade-in-up animate-delay-400">
              The link expires in 10 minutes. If it doesn&apos;t arrive, check
              your spam folder or request a new one below.
            </p>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full mt-6 uppercase tracking-wider animate-fade-in-up animate-delay-400"
              onClick={() => {
                setSentTo("");
                setAuthError("");
                formik.setFieldValue("email", "");
                formik.setSubmitCount(0);
              }}
            >
              Try another email
            </Button>

            <Link
              to="/login"
              className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary animate-fade-in-up animate-delay-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
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
              Reset your password
            </CardTitle>
            <CardDescription className="animate-fade-in-up animate-delay-400">
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>

          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-2 animate-fade-in-up animate-delay-100">
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
                  placeholder="you@hotel.com"
                  aria-invalid={emailError || undefined}
                  className={fieldClass(emailError)}
                />
              </div>
              {emailError && (
                <p className={errorClass}>{formik.errors.email}</p>
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
              className="w-full mt-2 uppercase tracking-wider animate-fade-in-up animate-delay-200"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                "Sending link…"
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3.5 animate-fade-in-up animate-delay-300">
            <KeyRound
              className="mt-0.5 w-4 h-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              For your security, the reset link is valid for 10 minutes and can
              only be used once.
            </p>
          </div>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary animate-fade-in-up animate-delay-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
