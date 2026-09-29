import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UtensilsCrossed,
  CalendarDays,
  BedDouble,
  User,
  Receipt,
  Clock,
} from "lucide-react";
import { getMyOrderById } from "../../api/resturantOrderApi";
import { showToast } from "../../components/common/Toast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";

const STATUS_META = {
  pending: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  preparing: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  served: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  cancelled: "text-red-600 bg-red-500/10 border-red-500/30",
};

const CATEGORY_LABELS = {
  starter: "Starter",
  main: "Main Course",
  dessert: "Dessert",
  drinks: "Drinks",
  snacks: "Snacks",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setNotFound(false);

    getMyOrderById(id)
      .then((res) => {
        if (!active) return;
        if (res?.order) {
          setOrder(res.order);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        if (!active) return;
        setNotFound(true);
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not load order",
        });
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const subtotal = (order?.items || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const guestName = order?.guest
    ? `${order.guest.firstName || ""} ${order.guest.lastName || ""}`.trim() ||
      order.guest.email
    : "—";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/guest/orders" />}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : notFound || !order ? (
        <Card className="p-12 text-center">
          <UtensilsCrossed className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            Order not found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This order does not exist or is not linked to your account.
          </p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link to="/guest/orders" />}
          >
            View my orders
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden animate-fade-in-up animate-delay-100">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/40 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Room service order
                  </p>
                  <h1 className="font-display text-2xl text-foreground">
                    #{order._id.slice(-6).toUpperCase()}
                  </h1>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`capitalize ${STATUS_META[order.status] || ""}`}
              >
                {order.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
              {[
                {
                  icon: Clock,
                  label: "Placed on",
                  value: formatDate(order.createdAt),
                },
                {
                  icon: CalendarDays,
                  label: "Last updated",
                  value: formatDate(order.updatedAt),
                },
                {
                  icon: BedDouble,
                  label: "Delivered to",
                  value: order.room?.number
                    ? `Room ${order.room.number}`
                    : "Room service",
                },
                {
                  icon: User,
                  label: "Guest",
                  value: guestName,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 bg-card px-6 py-4">
                  <Icon className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="animate-fade-in-up animate-delay-200">
            <CardContent className="p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-lg text-foreground">
                  Items ordered
                </h2>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} item
                  {order.items.length > 1 ? "s" : ""}
                </p>
              </div>

              <ul className="mt-5 space-y-3">
                {order.items.map((item, idx) => {
                  const category = item.menuItem?.category;
                  return (
                    <li
                      key={item.menuItem?._id || idx}
                      style={{ animationDelay: `${Math.min(idx, 6) * 60}ms` }}
                      className="flex items-center justify-between gap-6 rounded-xl border border-border px-4 py-3.5 animate-fade-in-up"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">
                            {item.menuItem?.name || "Menu item"}
                          </p>
                          {category && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                              {CATEGORY_LABELS[category] || category}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-5">
                        <span className="text-sm text-muted-foreground tabular-nums">
                          × {item.quantity}
                        </span>
                        <span className="min-w-20 text-right text-sm font-semibold text-foreground tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 space-y-2 rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-display text-xl text-primary tabular-nums">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/guest/orders" />}
            >
              All orders
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/guest/menu" />}
            >
              Order more
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;