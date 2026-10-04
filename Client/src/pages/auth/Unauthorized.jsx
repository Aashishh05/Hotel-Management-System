import { useNavigate } from "react-router-dom";
import { Hexagon, ShieldAlert } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isGuest = user?.role?.name === "guest";
  const homePath = isGuest ? "/guest" : "/dashboard";

  return (
    <div className="grid min-h-svh place-items-center px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <Card className="w-full max-w-md text-center animate-fade-in-up">
        <CardContent className="p-8">
          <CardHeader className="flex flex-col items-center text-center px-0">
            <Hexagon
              className="w-10 h-10 text-primary cursor-pointer"
              onClick={() => navigate("/")}
              strokeWidth={2.5}
            />
            <span className="mt-3 text-xs tracking-[0.25em] uppercase text-primary">
              Grand Horizon Hotel
            </span>

            <div className="mt-6 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <CardTitle className="font-display text-3xl mt-4">
              Access denied
            </CardTitle>
            <CardDescription className="mt-2">
              Your role does not have permission to view this page. If you think
              that is wrong, ask a hotel admin to enable it for you.
            </CardDescription>
          </CardHeader>

          <div className="flex flex-col sm:flex-row justify-center gap-2 mt-8">
            <Button type="button" size="lg" onClick={() => navigate(homePath)}>
              Back to {isGuest ? "my portal" : "dashboard"}
            </Button>

            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Go to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;