import useAuth from "../../hooks/useAuth.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

const Dashboard = () => {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {firstName}</CardTitle>
          <CardDescription>
            Your dashboard is ready. Module pages will be added here next.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {["Rooms", "Bookings", "Guests", "Revenue"].map((label) => (
          <Card key={label} className="animate-pulse p-5">
            <CardContent className="space-y-4 px-0">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-2 w-24 bg-muted-foreground/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;