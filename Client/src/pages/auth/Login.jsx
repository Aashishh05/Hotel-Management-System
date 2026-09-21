import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Hexagon } from "lucide-react";
import { loginApi } from "../../api/authApi";
import { login } from "../../redux/authSlice";
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
        dispatch(login({ user: res?.data, token: res?.token ?? null }));
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
            className="w-full mt-2 rounded-lg bg-gradient-to-r from-[#D9B872] to-[#C9A15A] text-white text-sm font-semibold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A15A]/50"
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
      </div>
    </div>
  );
};

export default Login;
