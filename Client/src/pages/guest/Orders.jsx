import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, UtensilsCrossed, ChevronRight } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary gap-1.5"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          My Orders
        </Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
          My orders
        </h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <CardContent className="px-0 flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-5 w-20" />
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
          <p className="mt-2 text-sm text-muted-foreground">
            Order room service from the menu.
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
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <Link
              key={order._id}
              to={`/guest/orders/${order._id}`}
              style={{ animationDelay: `${Math.min(idx, 5) * 70}ms` }}
              className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 animate-fade-in-up"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items.length} item
                    {order.items.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`capitalize ${STATUS_META[order.status] || ""}`}
                  >
                    {order.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;