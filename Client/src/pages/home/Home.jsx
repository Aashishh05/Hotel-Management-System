import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Hexagon,
  Wifi,
  UtensilsCrossed,
  Waves,
  Car,
  Sparkles,
  ArrowRight,
  BedDouble,
  LayoutGrid,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { getPublicRooms } from "../../api/roomApi";
import { logoutApi } from "../../api/authApi";
import useAuth from "../../hooks/useAuth.js";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Reveal from "../../components/common/Reveal";
import ThemeToggle from "../../components/common/ThemeToggle";

const roomTypeLabel = (type) => {
  const labels = {
    single: "Single Room",
    double: "Double Room",
    suite: "Suite",
    deluxe: "Deluxe Suite",
  };
  return labels[type] || type;
};

const amenitiesSample = [
  { Icon: Wifi, label: "High-Speed Wi-Fi" },
  { Icon: UtensilsCrossed, label: "Fine Dining" },
  { Icon: Waves, label: "Infinity Pool" },
  { Icon: Sparkles, label: "Spa & Wellness" },
  { Icon: Car, label: "Airport Shuttle" },
];

const Home = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logoutUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "there";
  const initials = (user?.name || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutApi();
    } catch (error) {
      console.log(error);
    }
    logoutUser();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    let active = true;
    getPublicRooms()
      .then((res) => active && setRooms(res?.rooms || []))
      .catch(() => active && setRooms([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-8 animate-fade-in">
        <Link
          to="/"
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Hexagon className="w-7 h-7 text-primary" strokeWidth={2.5} />
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide">
              Grand Horizon
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-primary">
              Hotel Management
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#rooms" className="hover:text-foreground transition-colors">
            Rooms
          </a>
          <a
            href="#amenities"
            className="hover:text-foreground transition-colors"
          >
            Amenities
          </a>
          <a href="#about" className="hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </span>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {firstName}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <p className="px-1.5 pb-1 text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link to="/dashboard" />}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={loggingOut}
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Logging out…" : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/login" />}>
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<Link to="/register" />}>
                Get started
              </Button>
            </div>
          )}
        </div>
      </header>

      <section
        id="about"
        className="relative overflow-hidden flex flex-col items-center text-center px-4 pt-20 pb-16 lg:pt-28 lg:pb-24"
      >
        <Hexagon
          className="absolute -top-6 right-8 w-64 h-64 text-primary/5 rotate-12 lg:w-96 lg:h-96"
          strokeWidth={1}
        />
        <Hexagon
          className="absolute top-24 -left-16 w-72 h-72 text-primary/5 -rotate-12 lg:w-96 lg:h-96"
          strokeWidth={1}
        />

        {user ? (
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/30 text-primary gap-1.5 animate-fade-in-up"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Welcome back, {firstName}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/30 text-primary gap-1.5 animate-fade-in-up"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Luxury stays, reimagined
          </Badge>
        )}

        <h1 className="mt-6 max-w-3xl font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground animate-fade-in-up animate-delay-100">
          Experience Luxury,
          <span className="text-primary"> Welcome Home</span>
        </h1>

        <p className="mt-5 max-w-xl text-muted-foreground animate-fade-in-up animate-delay-200">
          Grand Horizon Hotel blends refined comfort with modern convenience.
          Explore our rooms, unwind in our amenities, and let us host an
          unforgettable stay.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-delay-300">
          <Button
            size="lg"
            className="uppercase tracking-wider"
            nativeButton={false}
            render={<a href="#rooms" />}
          >
            View our rooms
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" nativeButton={false} render={<Link to="/register" />}>
            Plan your stay
          </Button>
        </div>
      </section>

      <Separator />

      <section id="rooms" className="px-4 py-16 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-primary">
                Featured rooms
              </span>
              <h2 className="font-display text-3xl mt-2 text-foreground">
                Rooms & Suites
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Currently available rooms at Grand Horizon.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link to="/register" />}
            >
              Book a stay
            </Button>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <CardContent className="space-y-4 px-0">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-full bg-muted-foreground/10" />
                    <Skeleton className="h-3 w-3/4 bg-muted-foreground/10" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <Reveal>
              <Card className="p-10 text-center">
                <BedDouble className="mx-auto w-10 h-10 text-primary" />
                <h3 className="mt-4 font-display text-xl text-foreground">
                  No rooms available yet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  We're preparing our rooms. Check back soon or sign in to
                  manage the hotel.
                </p>
              </Card>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room, i) => (
                <Reveal key={room._id} className="h-full" delay={(i % 3) * 120}>
                  <Card className="flex flex-col p-5 h-full">
                    <div className="h-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                      <BedDouble className="w-10 h-10 text-primary" />
                    </div>

                    <CardHeader className="px-0 pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle>
                          Room {room.number} · {roomTypeLabel(room.type)}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/40 bg-primary/10 shrink-0"
                        >
                          {room.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Floor {room.floor ?? "—"} ·{" "}
                        <span className="text-primary font-semibold text-base">
                          ${room.pricePerNight}
                        </span>
                        <span className="text-muted-foreground"> / night</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-0 pt-3 space-y-3 flex-1">
                      {room.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {room.amenities.map((amenity) => (
                            <Badge
                              key={amenity}
                              variant="secondary"
                              className="text-muted-foreground"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {room.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {room.description}
                        </p>
                      )}
                    </CardContent>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      nativeButton={false}
                      render={<Link to="/register" />}
                    >
                      Book this room
                    </Button>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator />

      <section id="amenities" className="px-4 py-16 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">
              What we offer
            </span>
            <h2 className="font-display text-3xl mt-2 text-foreground">
              World-class amenities
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {amenitiesSample.map(({ Icon, label }, i) => (
              <Reveal key={label} className="h-full" delay={i * 100}>
                <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 lg:px-8">
        <Reveal>
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Hexagon className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <span className="font-semibold text-sm tracking-wide">
                Grand Horizon Hotel
              </span>
            </div>

            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <Link
                to="/login"
                className="hover:text-foreground transition-colors"
              >
                Staff sign in
              </Link>
              <span className="flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Multi-module management</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} Grand Horizon Hotel. All rights
              reserved.
            </p>
          </div>
        </Reveal>
      </footer>
    </div>
  );
};

export default Home;
