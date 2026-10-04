import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "../../lib/utils";

const ScrollToTopButton = ({ threshold = 400 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-md text-primary transition-all duration-300 hover:text-chart-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ArrowUp className="size-6" />
    </button>
  );
};

export default ScrollToTopButton;