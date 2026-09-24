import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Hexagon } from "lucide-react";
import { registerApi } from "../../api/authApi";
import { showToast } from "../../components/common/Toast";

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
        navigate("/", { replace: true });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "We couldn't create your account. Check your details and try again.";
        setAuthError(message);
        showToast({ type: "error", message });
      }
    },
  });

  const inputClass = (hasError) =>
    `w-full rounded-lg bg-slate-50 border ${hasError ? "border-red-400" : "border-slate-300"} pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A]/10`;

  const passwordEye = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      disabled={formik.isSubmitting}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#C9A15A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A]/40 rounded"
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div
        className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-xl p-8"
        style={{
          fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div className="flex flex-col items-center text-center mb-8">
          <Hexagon className="w-10 h-10 text-[#C9A15A]" strokeWidth={2.5} />
          <span className="mt-3 text-xs tracking-[0.25em] uppercase text-[#C9A15A]">
            Grand Horizon Hotel
          </span>
          <h2 className="font-display text-3xl text-slate-900 mt-4">
            Create your account
          </h2>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className={formik.submitCount > 0 && formik.errors.name && "sm:col-span-2"}>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                  disabled={formik.isSubmitting}
                  placeholder="John Doe"
                  className={inputClass(formik.submitCount > 0 && formik.errors.name)}
                />
              </div>
              {formik.submitCount > 0 && formik.errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.name}</p>
              )}
            </div>

            <div className={formik.submitCount > 0 && formik.errors.email && "sm:col-span-2"}>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  disabled={formik.isSubmitting}
                  placeholder="johndoe@gmail.com"
                  className={inputClass(formik.submitCount > 0 && formik.errors.email)}
                />
              </div>
              {formik.submitCount > 0 && formik.errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            <div className={formik.submitCount > 0 && formik.errors.password && "sm:col-span-2"}>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  disabled={formik.isSubmitting}
                  placeholder="••••••••"
                  className={inputClass(formik.submitCount > 0 && formik.errors.password)}
                />
                {passwordEye}
              </div>
              {formik.submitCount > 0 && formik.errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.password}</p>
              )}
            </div>

            <div className={formik.submitCount > 0 && formik.errors.confirmPassword && "sm:col-span-2"}>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  disabled={formik.isSubmitting}
                  placeholder="••••••••"
                  className={inputClass(formik.submitCount > 0 && formik.errors.confirmPassword)}
                />
              </div>
              {formik.submitCount > 0 && formik.errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {authError && (
            <p
              role="alert"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5"
            >
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full rounded-lg bg-gradient-to-r from-[#D9B872] to-[#C9A15A] text-white text-sm font-semibold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A]/50"
          >
            {formik.isSubmitting ? (
              "Creating account…"
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 mt-6">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          type="button"
          className="w-full mt-5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 py-3 flex items-center justify-center gap-2.5 transition-colors hover:bg-slate-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A]/40"
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
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-[#C9A15A] hover:text-[#B89150] transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;