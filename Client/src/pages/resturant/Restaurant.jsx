
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  CheckCircle2,
  Trash2,
  Eye,
  RefreshCw,
  CalendarDays,
  BedDouble,
  User,
} from "lucide-react";
import {
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../../api/resturantOrderApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const STATUSES = ["pending", "preparing", "served", "cancelled"];
const FILTERS = ["all", ...STATUSES];

const STATUS_META = {
  pending: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  preparing: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  served: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  cancelled: "text-red-600 bg-red-500/10 border-red-500/30",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const orderLabel = (order) =>
  order?.orderNumber
    ? `#${order.orderNumber}`
    : `#${order?._id.slice(-6).toUpperCase()}`;

const guestName = (guest) =>
  guest
    ? `${guest.firstName || ""} ${guest.lastName || ""}`.trim() ||
      guest.email ||
      "Guest"
    : "—";

const Restaurant = () => {
  const { permissions } = useSelector((state) => state.permission);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const restaurantPerm = permissions?.modules?.restaurant;
  const canUpdate = restaurantPerm?.update === true;
  const canDelete = restaurantPerm?.delete === true;

  const loadOrders = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      const res = await getAllOrders();
      setOrders(res?.orders || []);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load restaurant orders",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (order, status) => {
    if (status === order.status) return;
    try {
      setUpdatingId(order._id);
      const res = await updateOrder(order._id, { status });
      setOrders((prev) =>
        prev.map((item) => (item._id === order._id ? res?.order : item)),
      );
      setDetailOrder((prev) =>
        prev && prev._id === order._id ? res?.order : prev,
      );
      showToast({
        type: "success",
        message: `Order marked as ${status}`,
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not update order",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteOrder(confirmDelete._id);
      setOrders((prev) => prev.filter((item) => item._id !== confirmDelete._id));
      setConfirmDelete(null);
      showToast({ type: "success", message: "Order deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete order",
      });
    } finally {
      setDeleting(false);
    }
  };

  const countByStatus = (status) =>
    orders.filter((order) => order.status === status).length;

  const visibleOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const stats = [
    { label: "Total Orders", value: orders.length, Icon: ClipboardList },
    { label: "Pending", value: countByStatus("pending"), Icon: UtensilsCrossed },
    { label: "Preparing", value: countByStatus("preparing"), Icon: ChefHat },
    { label: "Served", value: countByStatus("served"), Icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Restaurant</h1>
          <p className="text-sm text-muted-foreground">
            Room service and restaurant orders placed by guests.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadOrders(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, idx) => (
            <Card
              key={stat.label}
              className={`animate-fade-in-up animate-delay-${(idx + 1) * 100}`}
            >
              <CardContent className="py-3 flex items-center gap-3">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-lg font-semibold leading-none tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      {error && (
        <Card>
          <CardContent className="py-6 px-0">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden animate-fade-in-up animate-delay-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : visibleOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-14 text-center">
                  <UtensilsCrossed className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No orders here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Orders placed by guests will show up here."
                      : `No ${activeFilter} orders right now.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleOrders.map((order) => (
                <TableRow key={order._id} className="animate-fade-in-up">
                  <TableCell className="font-semibold text-foreground">
                    {orderLabel(order)}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {guestName(order.guest)}
                    </p>
                    {order.guest?.phone && (
                      <p className="text-xs text-muted-foreground">
                        {order.guest.phone}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.room ? order.room.number : "—"}
                  </TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    {canUpdate ? (
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order, value)
                        }
                        disabled={updatingId === order._id}
                        items={Object.fromEntries(
                          STATUSES.map((status) => [status, status]),
                        )}
                        className="w-32"
                      >
                        <SelectTrigger
                          className={`capitalize ${STATUS_META[order.status] || ""}`}
                          aria-label="Order status"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`capitalize ${STATUS_META[order.status] || ""}`}
                      >
                        {order.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailOrder(order)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                      {canDelete && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={order.status === "served"}
                          onClick={() => setConfirmDelete(order)}
                          aria-label={`Delete order ${order._id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={detailOrder !== null} onOpenChange={(open) => !open && setDetailOrder(null)}>
        {detailOrder && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Order {orderLabel(detailOrder)}</DialogTitle>
              <DialogDescription>
                Placed on {formatDate(detailOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Guest</p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {guestName(detailOrder.guest)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BedDouble className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="text-sm font-medium text-foreground">
                    {detailOrder.room?.number || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {detailOrder.status}
                  </p>
                </div>
              </div>
            </div>

            <ul className="rounded-lg border border-border divide-y divide-border">
              {detailOrder.items.map((item, idx) => (
                <li
                  key={item.menuItem?._id || idx}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="min-w-0 truncate text-foreground">
                    {item.menuItem?.name || "Menu item"}
                    <span className="text-muted-foreground">
                      {" "}× {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-foreground tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl text-primary tabular-nums">
                  {formatPrice(detailOrder.totalAmount)}
                </span>
              </div>
              {detailOrder.takenBy?.name && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Taken by {detailOrder.takenBy.name}
                  </p>
                </>
              )}
            </div>

            <DialogFooter>
              {canUpdate && (
                <Select
                  value={detailOrder.status}
                  onValueChange={(value) =>
                    handleStatusChange(detailOrder, value)
                  }
                  disabled={updatingId === detailOrder._id}
                  items={Object.fromEntries(
                    STATUSES.map((status) => [status, status]),
                  )}
                >
                  <SelectTrigger className="w-40 capitalize" aria-label="Order status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailOrder(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete order"
        message={`Delete order ${orderLabel(confirmDelete)}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Restaurant;
