import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Receipt,
  CalendarDays,
  BedDouble,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { getMyBillings } from "../../api/billingApi";
import { showToast } from "../../components/common/Toast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";

const STATUS_META = {
  unpaid: "text-red-600 bg-red-500/10 border-red-500/30",
  partial: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  paid: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const Bills = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyBillings()
      .then((res) => active && setBillings(res?.billings || []))
      .catch((err) =>
        active &&
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not load invoices",
        }),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const outstanding = billings.reduce(
    (sum, billing) =>
      sum + ((billing.totalAmount || 0) - (billing.paidAmount || 0)),
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/30 text-primary gap-1.5"
        >
          <Receipt className="w-3.5 h-3.5" />
          Invoices
        </Badge>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
          Your invoices
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Review the charges for your stays and payments so far.
        </p>
      </div>

      {!loading && billings.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 p-5 bg-muted/40">
            <Wallet className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total outstanding</p>
              <p className="font-display text-2xl text-foreground">
                {formatPrice(outstanding)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5">
              <CardContent className="space-y-3 px-0">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : billings.length === 0 ? (
        <Card className="p-10 text-center">
          <Receipt className="mx-auto w-10 h-10 text-primary" />
          <h3 className="mt-4 font-display text-xl text-foreground">
            No invoices yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Invoices are generated for your stays. Book a room to get started.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link to="/" />}
          >
            View rooms
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {billings.map((billing) => {
            const paid = billing.paidAmount || 0;
            const total = billing.totalAmount || 0;
            const due = total - paid;
            return (
              <Card key={billing._id} className="p-5">
                <CardContent className="space-y-4 px-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Invoice #{billing._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(billing.createdAt)}
                        {billing.booking?.room && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" />
                            Room {billing.booking.room.number}
                          </span>
                        )}
                        {billing.dueDate && (
                          <span>Due {formatDate(billing.dueDate)}</span>
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize ${STATUS_META[billing.status] || ""}`}
                    >
                      {billing.status}
                    </Badge>
                  </div>

                  {billing.items?.length > 0 && (
                    <ul className="rounded-lg border border-border bg-muted/40 divide-y divide-border">
                      {billing.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                        >
                          <span className="min-w-0 truncate text-foreground">
                            {item.description}
                            <span className="text-muted-foreground">
                              {" "}× {item.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {formatPrice(item.amount * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="grid grid-cols-3 gap-3 border-t border-border pt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold text-foreground">
                        {formatPrice(total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="font-semibold text-emerald-600">
                        {formatPrice(paid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Outstanding
                      </p>
                      <p
                        className={`flex items-center gap-1 font-semibold ${
                          due > 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {due > 0 ? (
                          formatPrice(due)
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Settled
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bills;