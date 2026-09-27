import { KeyRound } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

const Permissions = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl text-foreground">Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Control what each role can do module by module.
        </p>
      </div>

      <Card>
        <CardContent className="py-14 px-0 text-center">
          <KeyRound className="mx-auto w-9 h-9 text-muted-foreground" />
          <p className="mt-3 font-display text-lg text-foreground">
            Coming soon
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This page is not built yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;