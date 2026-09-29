import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, UtensilsCrossed, CalendarDays } from "lucide-react";
import { getMyOrders } from "../../api/resturantOrderApi";
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

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyOrders()
      .then((res) => active && setOrders(res?.orders || []))
      .catch((err) =>
        active &&
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not load orders",
        }),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary gap-1.5"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          My Orders
        </Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
          Room service orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Track the orders you placed from the restaurant menu.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <CardContent className="space-y-3 px-0">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-10 text-center">
          <UtensilsCrossed className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            No orders yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Hungry? Browse the menu and order room service.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link to="/guest/menu" />}
          >
            View menu
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-5">
              <CardContent className="space-y-4 px-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(order.createdAt)}
                      {order.room && <span> · Room {order.room.number}</span>}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`capitalize ${STATUS_META[order.status] || ""}`}
                  >
                    {order.status}
                  </Badge>
                </div>

                <ul className="rounded-lg border border-border bg-muted/40 divide-y divide-border">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate text-foreground">
                        {item.menuItem?.name || "Menu item"}
                        <span className="text-muted-foreground">
                          {" "}× {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total </span>
                    <span className="font-semibold text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;