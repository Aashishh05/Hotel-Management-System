import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Plus, Minus, ShoppingBag, Info } from "lucide-react";
import { getAvailableMenuItems } from "../../api/menuApi";
import { createMyOrder } from "../../api/resturantOrderApi";
import { getMyBookings } from "../../api/bookingApi";
import { showToast } from "../../components/common/Toast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";

const ACTIVE_STATUSES = ["pending", "confirmed", "checked-in"];

const CATEGORY_LABELS = {
  starter: "Starters",
  main: "Main Course",
  dessert: "Desserts",
  drinks: "Drinks",
  snacks: "Snacks",
};

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const Menu = () => {
  const navigate = useNavigate();
  const [rawMenu, setRawMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [activeStay, setActiveStay] = useState(null);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [menuRes, bookingRes] = await Promise.allSettled([
          getAvailableMenuItems(),
          getMyBookings(),
        ]);

        if (!active) return;

        if (menuRes.status === "fulfilled") {
          setRawMenu(menuRes.value?.menuItems || []);
        } else {
          showToast({
            type: "error",
            message:
              menuRes.reason?.response?.data?.message || "Could not load menu",
          });
        }

        if (bookingRes.status === "fulfilled") {
          const bookings = bookingRes.value?.bookings || [];
          setActiveStay(
            bookings.find((booking) =>
              ACTIVE_STATUSES.includes(booking?.status),
            ) || null,
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return rawMenu.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [rawMenu]);

  const filters = useMemo(
    () => [
      { key: "all", label: "All", count: rawMenu.length },
      ...Object.keys(CATEGORY_LABELS)
        .filter((category) => grouped[category]?.length)
        .map((category) => ({
          key: category,
          label: CATEGORY_LABELS[category],
          count: grouped[category].length,
        })),
    ],
    [rawMenu, grouped],
  );

  const visibleGroups = useMemo(() => {
    if (activeCategory === "all") return grouped;
    if (!grouped[activeCategory]) return {};
    return { [activeCategory]: grouped[activeCategory] };
  }, [grouped, activeCategory]);

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = rawMenu.find((menuItem) => menuItem._id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const addToCart = (item) => {
    if (!activeStay) return;
    setCart((prev) => ({ ...prev, [item._id]: (prev[item._id] || 0) + 1 }));
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[item._id] || next[item._id] <= 1) {
        delete next[item._id];
      } else {
        next[item._id] -= 1;
      }
      return next;
    });
  };

  const placeOrder = async () => {
    const items = Object.entries(cart).map(([menuItem, quantity]) => ({
      menuItem,
      quantity,
    }));

    if (items.length === 0) return;

    setPlacing(true);
    try {
      await createMyOrder({ items });
      showToast({ type: "success", message: "Order placed successfully" });
      setCart({});
      navigate("/guest/orders");
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not place order",
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary gap-1.5"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          Hotel Dining
        </Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
          Restaurant menu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Browse the menu and order room service to your door.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <CardContent className="space-y-3 px-0">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rawMenu.length === 0 ? (
        <Card className="p-10 text-center">
          <UtensilsCrossed className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            Menu is empty
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later, we are preparing fresh dishes.
          </p>
        </Card>
      ) : (
        <>
          {!activeStay && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 w-4.5 h-4.5 shrink-0 text-primary" />
              <p>
                Room service is available during your stay. Book a room and
                order food to your door.
              </p>
            </div>
          )}

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveCategory(filter.key)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === filter.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-1.5 text-xs tabular-nums ${
                    activeCategory === filter.key
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground/70"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {Object.entries(visibleGroups).map(([category, items]) => (
            <section key={category} className="space-y-4">
              <h2 className="font-display text-xl text-foreground">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const qty = cart[item._id] || 0;
                  return (
                    <Card
                      key={item._id}
                      className="p-5 transition-all hover:ring-2 hover:ring-primary/30"
                    >
                      <CardContent className="space-y-3 px-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-base text-foreground">
                            {item.name}
                          </h3>
                          <span className="shrink-0 text-sm font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between border-t border-border pt-3">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => removeFromCart(item)}
                                aria-label={`Remove one ${item.name}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="min-w-6 text-center text-sm font-medium tabular-nums">
                                {qty}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                onClick={() => addToCart(item)}
                                aria-label={`Add one ${item.name}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!activeStay}
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}

      {cartCount > 0 && !loading && (
        <div className="sticky bottom-4 z-10">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <p className="text-sm">
                <span className="font-semibold">{cartCount}</span>{" "}
                <span className="text-muted-foreground">
                  item{cartCount > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground"> · </span>
                <span className="font-semibold text-primary">
                  {formatPrice(cartTotal)}
                </span>
              </p>
            </div>
            <Button size="sm" onClick={placeOrder} disabled={placing}>
              {placing ? "Placing…" : "Place order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;