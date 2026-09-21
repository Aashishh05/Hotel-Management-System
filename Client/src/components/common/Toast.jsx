import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastBox = ({ t, type, message }) => {
  const [leaving, setLeaving] = useState(false);
  const isSuccess = type === "success";

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => toast.dismiss(t.id), 250);
  };

  useEffect(() => {
    const timer = setTimeout(dismiss, 2000);
    return () => clearTimeout(timer);
  
  }, []);

  return (
    <div
      className={`flex items-center gap-3 pl-4 pr-2.5 py-3 rounded-[10px] shadow-xl text-sm min-w-[280px] max-w-sm bg-white border text-slate-800 ${
        leaving ? "toast-leave" : "toast-enter"
      } ${isSuccess ? "border-[#C9A15A]/50" : "border-[#EF5350]/40"}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-[#C9A15A]" />
      ) : (
        <XCircle className="w-5 h-5 shrink-0 text-[#EF5350]" />
      )}

      <span className="flex-1 leading-snug">{message}</span>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1.5 rounded-full transition-colors text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const showToast = ({ type, message }) => {
  toast.custom((t) => <ToastBox t={t} type={type} message={message} />, {
    duration: 3000,
  });
};