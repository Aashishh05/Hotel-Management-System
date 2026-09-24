import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Hexagon } from "lucide-react";
import { loginApi } from "../../api/authApi";
import { getMyPermissions } from "../../api/permissionApi";
import { login } from "../../redux/authSlice";
import { setPermission } from "../../redux/permissionSlice";
import { showToast } from "../../components/common/Toast";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const formik = useFormik({
    initialValues: { email: "", password: "", remember: false },
    validationSchema,
    onSubmit: async (values) => {
      setAuthError("");
      try {
        const res = await loginApi({
          email: values.email,
          password: values.password,
        });
        dispatch(login({ user: res?.data }));

        try {
          const permRes = await getMyPermissions();
          dispatch(setPermission(permRes?.permission));
        } catch {
          dispatch(setPermission(null));
        }

        showToast({
          type: "success",
          message: "Logged in successfully. Welcome back!",
        });
        navigate("/", { replace: true });
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "We couldn't sign you in. Check your details and try again.";
        setAuthError(message);
        showToast({ type: "error", message });
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div
        className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-8"
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
            Welcome back
          </h2>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
          <div>
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
                placeholder="you@hotel.com"
                className={`w-full rounded-lg bg-slate-50 border ${formik.submitCount > 0 && formik.errors.email ? "border-red-400" : "border-slate-300"} pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A]/10`}
              />
            </div>
            {formik.submitCount > 0 && formik.errors.email && (
              <p className="mt-1.5 text-xs text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div>
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
                autoComplete="current-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                disabled={formik.isSubmitting}
                placeholder="••••••••"
                className={`w-full rounded-lg bg-slate-50 border ${formik.submitCount > 0 && formik.errors.password ? "border-red-400" : "border-slate-300"} pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A]/10`}
              />
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
            </div>
            {formik.submitCount > 0 && formik.errors.password && (
              <p className="mt-1.5 text-xs text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                name="remember"
                checked={formik.values.remember}
                onChange={formik.handleChange}
                disabled={formik.isSubmitting}
                className="w-4 h-4 rounded border-slate-300 bg-white accent-[#C9A15A] focus:ring-[#C9A15A]/40"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-[#C9A15A] hover:text-[#B89150] transition-colors hover:underline"
            >
              Forgot password?
            </Link>
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
            className="w-full mt-2 rounded-lg bg-gradient-to-r from-[#D9B872] to-[#C9A15A] text-white text-sm font-semibold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A]/50"
          >
            {formik.isSubmitting ? (
              "Signing in…"
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 mt-5">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          type="button"
          className="w-full mt-5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 py-3 flex items-center justify-center gap-2.5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A]/40"
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
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#C9A15A] hover:text-[#B89150] transition-colors hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
