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
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { getPublicRooms } from "../../api/roomApi";
import { logoutApi } from "../../api/authApi";
import useAuth from "../../hooks/useAuth.js";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { showToast } from "../../components/common/Toast";
import BookingForm from "../bookings/BookingForm.jsx";
import RoomCard from "../rooms/RoomCard";
import {
  Card,
  CardContent,
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
import ScrollToTopButton from "../../components/common/ScrollToTopButton";

const amenitiesSample = [
  { Icon: Wifi, label: "High-Speed Wi-Fi" },
  { Icon: UtensilsCrossed, label: "Fine Dining" },
  { Icon: Waves, label: "Infinity Pool" },
  { Icon: Sparkles, label: "Spa & Wellness" },
  { Icon: Car, label: "Airport Shuttle" },
];

const FEATURED_ROOMS_LIMIT = 6;

const Home = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomsTotal, setRoomsTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logoutUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRoomId, setBookingRoomId] = useState(null);
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { id: "about", label: "About" },
    { id: "rooms", label: "Rooms" },
    { id: "amenities", label: "Amenities" },
  ];

  const openBookingForm = () => {
    setBookingRoomId(null);
    setBookingOpen(true);
  };

  const bookRoom = (room) => {
    setBookingRoomId(room._id);
    setBookingOpen(true);
  };

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
    getPublicRooms({ page: 1, limit: 6 })
      .then((res) => {
        if (!active) return;
        setRooms(res?.rooms || []);
        setRoomsTotal(res?.total ?? null);
      })
      .catch(() => active && setRooms([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (event, id) => {
    event.preventDefault();
    const section = document.getElementById(id);
    if (!section) return;
    setActiveSection(id);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <header className="fixed top-0 inset-x-0 z-30 h-16 bg-background/60 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/40 border-b border-border/60 shadow-sm shadow-black/5 flex items-center justify-between px-4 lg:px-8 animate-fade-in">
        <Link
          to="/"
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Hexagon className="w-7 h-7 text-primary" strokeWidth={2.5} />
          <span className="text-sm font-semibold tracking-wide leading-tight">
            Grand Horizon Hotel
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {navLinks.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(event) => handleNavClick(event, id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative pb-1 transition-colors duration-500 ${
                  isActive ? "text-foreground" : ""
                }`}
              >
                {label}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-primary transition-transform duration-500 ease-out ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            );
          })}
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
                <DropdownMenuItem
                  render={
                    <Link
                      to={user?.role?.name === "guest" ? "/guest" : "/dashboard"}
                    />
                  }
                >
                  {user?.role?.name === "guest" ? (
                    <BedDouble className="w-4 h-4" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user?.role?.name === "guest" ? "My Dashboard" : "Dashboard"}
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

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {menuOpen && (
        <>
          {/* Tap anywhere outside the panel to close it */}
          <div
            className="fixed top-16 inset-x-0 bottom-0 z-20 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          <nav
            id="mobile-nav"
            className="fixed top-16 inset-x-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-black/5 animate-fade-in md:hidden"
          >
            <div className="px-4 py-3 flex flex-col">
              {navLinks.map(({ id, label }) => {
                const isActive = activeSection === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={(event) => {
                      handleNavClick(event, id);
                      setMenuOpen(false);
                    }}
                    className={`relative py-3 text-sm transition-colors duration-500 border-b border-border/40 last:border-b-0 ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </a>
                );
              })}

              <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                {user ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      nativeButton={false}
                      render={
                        <Link
                          to={
                            user?.role?.name === "guest"
                              ? "/guest"
                              : "/dashboard"
                          }
                        />
                      }
                    >
                      {user?.role?.name === "guest" ? "My Dashboard" : "Dashboard"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={loggingOut}
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      {loggingOut ? "Logging out…" : "Log out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      nativeButton={false}
                      render={<Link to="/login" />}
                    >
                      Sign in
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      nativeButton={false}
                      render={<Link to="/register" />}
                    >
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
        </>
      )}

      <section
        id="about"
        className="relative overflow-hidden flex flex-col items-center text-center px-4 pt-14 pb-10 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-24 scroll-mt-16"
      >
        <Hexagon
          className="absolute -top-6 right-8 w-44 h-44 sm:w-64 sm:h-64 text-primary/5 rotate-12 lg:w-96 lg:h-96"
          strokeWidth={1}
        />
        <Hexagon
          className="absolute top-24 -left-16 w-52 h-52 sm:w-72 sm:h-72 text-primary/5 -rotate-12 lg:w-96 lg:h-96"
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

        <h1 className="mt-4 sm:mt-6 max-w-3xl font-display text-3xl min-[420px]:text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground animate-fade-in-up animate-delay-100">
          Experience Luxury,
          <span className="text-primary"> Welcome Home</span>
        </h1>

        <p className="mt-3 sm:mt-5 max-w-xl text-sm sm:text-base text-muted-foreground animate-fade-in-up animate-delay-200">
          Grand Horizon Hotel blends refined comfort with modern convenience.
          Explore our rooms, unwind in our amenities, and let us host an
          unforgettable stay.
        </p>

        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-delay-300">
          <Button
            size="lg"
            className="uppercase tracking-wider"
            nativeButton={false}
            render={<a href="#rooms" />}
          >
            View our rooms
            <ArrowRight className="w-4 h-4" />
          </Button>
          {user ? (
            <Button
              variant="outline"
              size="lg"
              onClick={openBookingForm}
            >
              Plan your stay
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link to="/login" />}
            >
              Plan your stay
            </Button>
          )}
        </div>
      </section>

      <Separator />

      <section id="rooms" className="px-4 py-10 sm:py-16 lg:px-8 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-primary">
                Featured rooms
              </span>
              <h2 className="font-display text-2xl sm:text-3xl mt-2 text-foreground">
                Rooms & Suites
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every room Grand Horizon has to offer — see what's available
                and what's already booked.
              </p>
            </div>
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={openBookingForm}
              >
                Book a stay
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link to="/login" />}
              >
                Book a stay
              </Button>
            )}
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 min-[420px]:p-5">
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
              <Card className="p-7 min-[420px]:p-10 text-center">
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.slice(0, FEATURED_ROOMS_LIMIT).map((room, i) => (
                  <Reveal
                    key={room._id}
                    className="h-full"
                    delay={(i % 3) * 120}
                  >
                    <RoomCard room={room} user={user} onBook={bookRoom} />
                  </Reveal>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2">
                {roomsTotal !== null && roomsTotal > FEATURED_ROOMS_LIMIT && (
                  <p className="text-xs text-muted-foreground">
                    Showing {FEATURED_ROOMS_LIMIT} of {roomsTotal} rooms
                  </p>
                )}
                <Button
                  variant="outline"
                  className="min-w-48 uppercase tracking-wider"
                  nativeButton={false}
                  render={<Link to="/all-rooms" />}
                >
                  See more rooms
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <Separator />

      <section id="amenities" className="px-4 py-10 sm:py-16 lg:px-8 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-7 sm:mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">
              What we offer
            </span>
            <h2 className="font-display text-2xl sm:text-3xl mt-2 text-foreground">
              World-class amenities
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {amenitiesSample.map(({ Icon, label }, i) => (
              <Reveal key={label} className="h-full" delay={i * 100}>
                <div className="flex h-full flex-col items-center gap-2.5 sm:gap-3 rounded-xl border border-border bg-card p-4 sm:p-6 text-center">
                  <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-9 sm:py-12 lg:px-8">
        <Reveal>
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-3.5 sm:gap-5 text-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Hexagon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" strokeWidth={2.5} />
              <span className="font-display text-xl sm:text-2xl font-semibold tracking-wide text-foreground">
                Grand Horizon Hotel
              </span>
            </div>

            <span className="h-px w-16 bg-border" />

            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Grand Horizon Hotel. All rights
              reserved.
            </p>
          </div>
        </Reveal>
      </footer>

      {bookingOpen && (
        <BookingForm
          open
          onOpenChange={(open) => !open && setBookingOpen(false)}
          rooms={rooms}
          initialRoomId={bookingRoomId}
          onCreated={(booking) => {
            showToast({
              type: "success",
              message: "Booking created successfully",
            });
            navigate(`/bookings/${booking._id}`);
          }}
        />
      )}

      <ScrollToTopButton />
    </div>
  );
};

export default Home;
