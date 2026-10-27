import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  RotateCcw,
  Hexagon,
  Sparkles,
} from "lucide-react";
import { getPublicRooms } from "../../api/roomApi";
import { logoutApi } from "../../api/authApi";
import useAuth from "../../hooks/useAuth.js";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { showToast } from "../../components/common/Toast";
import BookingForm from "../bookings/BookingForm.jsx";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Reveal from "../../components/common/Reveal";
import ThemeToggle from "../../components/common/ThemeToggle";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import RoomCard from "./RoomCard";

const ROOM_TYPES = ["single", "double", "suite", "deluxe"];
const ROOM_STATUSES = [
  "available",
  "reserved",
  "cleaning",
  "occupied",
  "maintenance",
];

const DEFAULT_FILTERS = {
  search: "",
  type: "all",
  status: "all",
  floor: "all",
  minPrice: "",
  maxPrice: "",
  sort: "number",
};

const ExploreRooms = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRoomId, setBookingRoomId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const bookRoom = (room) => {
    setBookingRoomId(room._id);
    setBookingOpen(true);
  };

  const firstName = user?.name?.split(" ")[0] || "there";

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

  const floors = useMemo(
    () =>
      [...new Set(rooms.map((room) => room.floor).filter(Boolean))].sort(
        (a, b) => a - b,
      ),
    [rooms],
  );

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filtersActive = useMemo(
    () =>
      Object.entries(DEFAULT_FILTERS).some(
        ([key, value]) => filters[key].toString() !== value.toString(),
      ),
    [filters],
  );

  const filteredRooms = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);

    let result = rooms.filter((room) => {
      if (filters.type !== "all" && room.type !== filters.type) return false;
      if (filters.status !== "all" && room.status !== filters.status) {
        return false;
      }
      if (filters.floor !== "all" && String(room.floor) !== filters.floor) {
        return false;
      }
      if (filters.minPrice && room.pricePerNight < minPrice) return false;
      if (filters.maxPrice && room.pricePerNight > maxPrice) return false;
      if (search) {
        const haystack = [
          room.number,
          room.type,
          room.description,
          ...(room.amenities || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    result = [...result];

    if (filters.sort === "price-asc") {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (filters.sort === "price-desc") {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else {
      result.sort((a, b) =>
        String(a.number).localeCompare(String(b.number), undefined, {
          numeric: true,
        }),
      );
    }

    return result;
  }, [rooms, filters]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-30 h-16 bg-background/60 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/40 border-b border-border/60 shadow-sm shadow-black/5 flex items-center justify-between px-4 lg:px-8 animate-fade-in">
        <div className="flex items-center gap-3">
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
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/my-stay" />}>
                My stay
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/login" />}>
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<Link to="/register" />}>
                Get started
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="px-4 pt-24 pb-10 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center">
            <Badge
              variant="outline"
              className="bg-primary/10 border-primary/30 text-primary gap-1.5 animate-fade-in-up"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {user ? `Welcome back, ${firstName}` : "Luxury stays, reimagined"}
            </Badge>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl text-foreground animate-fade-in-up animate-delay-100">
              All Rooms &amp; Suites
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground animate-fade-in-up animate-delay-200">
              Browse every room Grand Horizon has to offer. Filter by type,
              price, floor and availability to find your perfect stay.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Card className="p-5 mb-8">
              <CardContent className="px-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="f-search">Search</Label>
                    <Input
                      id="f-search"
                      value={filters.search}
                      onChange={(e) => setFilter("search", e.target.value)}
                      placeholder="Room number, amenity or keyword…"
                      aria-label="Search rooms"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Room type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilter("type", value || "all")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            <span className="capitalize">{type}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilter("status", value || "all")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any status</SelectItem>
                        {ROOM_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="capitalize">{status}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Select
                      value={filters.floor}
                      onValueChange={(value) => setFilter("floor", value || "all")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any floor</SelectItem>
                        {floors.map((floor) => (
                          <SelectItem key={floor} value={String(floor)}>
                            Floor {floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="f-min-price">Min price / night ($)</Label>
                    <Input
                      id="f-min-price"
                      type="number"
                      min="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilter("minPrice", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="f-max-price">Max price / night ($)</Label>
                    <Input
                      id="f-max-price"
                      type="number"
                      min="0"
                      value={filters.maxPrice}
                      onChange={(e) => setFilter("maxPrice", e.target.value)}
                      placeholder="500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort by</Label>
                    <Select
                      value={filters.sort}
                      onValueChange={(value) => setFilter("sort", value || "number")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Room number</SelectItem>
                        <SelectItem value="price-asc">Price: low to high</SelectItem>
                        <SelectItem value="price-desc">
                          Price: high to low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {filteredRooms.length}
                    </span>{" "}
                    of {rooms.length} rooms
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!filtersActive}
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset filters
                  </Button>
                </div>
              </CardContent>
            </Card>
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
          ) : filteredRooms.length === 0 ? (
            <Reveal>
              <Card className="p-10 text-center">
                <BedDouble className="mx-auto w-10 h-10 text-primary" />
                <h3 className="mt-4 font-display text-xl text-foreground">
                  No rooms match your filters
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Try widening the price range, clearing the search, or
                  resetting the filters below.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  disabled={!filtersActive}
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset filters
                </Button>
              </Card>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room, i) => (
                <Reveal
                  key={room._id}
                  className="h-full"
                  delay={(i % 3) * 120}
                >
                  <RoomCard room={room} user={user} onBook={bookRoom} />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal className="mt-10 flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link to="/" />}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Button>
          </Reveal>
        </div>
      </section>

      <Separator />

      <footer className="border-t border-border px-4 py-10 lg:px-8">
        <Reveal>
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <Hexagon className="w-8 h-8 text-primary" strokeWidth={2.5} />
              <span className="font-display text-2xl font-semibold tracking-wide text-foreground">
                Grand Horizon Hotel
              </span>
            </div>
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

export default ExploreRooms;
