import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { KeyRound, Save, ShieldAlert } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { getAllRoles } from "../../api/roleApi";
import {
  getPermissionByRole,
  createPermission,
  updatePermissionByRole,
} from "../../api/permissionApi";
import { showToast } from "../../components/common/Toast";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles" },
  { key: "permissions", label: "Permissions" },
  { key: "rooms", label: "Rooms" },
  { key: "bookings", label: "Bookings" },
  { key: "checkin-checkout", label: "Check In / Out" },
  { key: "guests", label: "Guests" },
  { key: "housekeeping", label: "Housekeeping" },
  { key: "maintenance", label: "Maintenance" },
  { key: "payment", label: "Payments" },
  { key: "billing", label: "Billing" },
  { key: "menu", label: "Menu" },
  { key: "restaurant", label: "Restaurant" },
  { key: "reports", label: "Reports" },
  { key: "audit-logs", label: "Audit Logs" },
  { key: "notifications", label: "Notifications" },
];

const ACTIONS = [
  { key: "read", label: "Read" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

const EMPTY = { read: false, create: false, update: false, delete: false };

const moduleLabel = (key) =>
  MODULES.find((m) => m.key === key)?.label || key.replace(/-/g, " ");

const countEnabled = (modules) =>
  Object.entries(modules).filter(
    ([, perms]) =>
      perms && Object.values(perms).some((value) => Boolean(value)),
  ).length;

const Permissions = () => {
  const { user: me } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissionDoc, setPermissionDoc] = useState(null);
  const [modules, setModules] = useState({});
  const [loadingPerm, setLoadingPerm] = useState(false);
  const [saving, setSaving] = useState(false);

  const roleName = me?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const permPerm = permissions?.modules?.permissions;
  const canRead = isSuperAdmin || permPerm?.read === true;
  const canUpdate = isSuperAdmin || permPerm?.update === true;

  useEffect(() => {
    let active = true;
    getAllRoles()
      .then((res) => active && setRoles(res?.roles || []))
      .catch(() => active && setRoles([]))
      .finally(() => active && setRolesLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const selectedRole = useMemo(
    () => roles.find((role) => role._id === selectedRoleId),
    [roles, selectedRoleId],
  );

  const moduleKeys = useMemo(() => {
    const keys = new Set(MODULES.map((m) => m.key));
    Object.keys(modules).forEach((key) => keys.add(key));
    return Array.from(keys);
  }, [modules]);

  const loadPermission = async (roleId) => {
    setLoadingPerm(true);
    setPermissionDoc(null);
    setModules({});
    try {
      const res = await getPermissionByRole(roleId);
      const docs = res?.permission?.modules || {};
      setPermissionDoc(res?.permission || null);
      setModules(docs);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPermissionDoc(null);
        setModules({});
      } else {
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not load permissions",
        });
      }
    } finally {
      setLoadingPerm(false);
    }
  };

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    loadPermission(roleId);
  };

  const toggleAction = (key, action, checked) => {
    setModules((prev) => ({
      ...prev,
      [key]: { ...EMPTY, ...prev[key], [action]: Boolean(checked) },
    }));
  };

  const toggleAll = (key, checked) => {
    setModules((prev) => ({
      ...prev,
      [key]: checked
        ? { read: true, create: true, update: true, delete: true }
        : { ...EMPTY },
    }));
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    const isOwnRole = selectedRole._id === me?.role?._id;
    if (
      !isSuperAdmin &&
      isOwnRole &&
      !(modules.permissions?.read ?? false)
    ) {
      showToast({
        type: "error",
        message: "You cannot remove your own access to Permissions.",
      });
      return;
    }
    try {
      setSaving(true);
      const payload = { modules };
      if (permissionDoc) {
        await updatePermissionByRole(selectedRole._id, payload);
        showToast({ type: "success", message: "Permissions updated" });
      } else {
        const res = await createPermission({ role: selectedRole._id, ...payload });
        setPermissionDoc(res?.permission || null);
        showToast({ type: "success", message: "Permissions created" });
      }
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not save permissions",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!canRead) {
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
            <ShieldAlert className="mx-auto w-9 h-9 text-muted-foreground" />
            <p className="mt-3 font-display text-lg text-foreground">
              Access denied
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You don&apos;t have permission to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl text-foreground">Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Control what each role can do module by module.
        </p>
      </div>

      <div className="max-w-sm space-y-2">
        <Label htmlFor="f-role">Role</Label>
        <Select value={selectedRoleId} onValueChange={handleSelectRole}>
          <SelectTrigger id="f-role" className="w-full">
            <SelectValue>
              <span className={selectedRole ? "" : "text-muted-foreground"}>
                {selectedRole
                  ? `${selectedRole.displayName} (${selectedRole.name})`
                  : "Select a role"}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {rolesLoading ? (
              <SelectItem value="" disabled>
                Loading roles…
              </SelectItem>
            ) : (
              roles.map((role) => (
                <SelectItem key={role._id} value={role._id}>
                  {role.displayName} ({role.name})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {selectedRole && (
          <p className="text-xs text-muted-foreground">
            {selectedRole.name} · {countEnabled(modules)} of{" "}
            {moduleKeys.length} modules enabled
          </p>
        )}
      </div>

      <Card className="animate-fade-in-up animate-delay-150 overflow-hidden">
          <CardContent className="p-0">
            {!selectedRole ? (
              <div className="py-16 text-center">
                <KeyRound className="mx-auto w-9 h-9 text-primary" />
                <p className="mt-3 font-display text-lg text-foreground">
                  Select a role
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a role above to view and edit its permissions.
                </p>
              </div>
            ) : loadingPerm ? (
              <div className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-28" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full" />
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg text-foreground">
                        {selectedRole.displayName}
                      </h2>
                      {selectedRole.isSystem && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedRole.name} · {countEnabled(modules)} of{" "}
                      {moduleKeys.length} modules enabled
                    </p>
                  </div>
                </div>

                {!permissionDoc && (
                  <div className="mx-5 mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    This role has no permission record yet. Set what it can
                    access below and save to create it.
                  </div>
                )}

                <div className="overflow-x-auto px-5 py-4">
                  <table className="w-full min-w-[520px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="pb-3 font-medium pr-4">Module</th>
                        <th className="pb-3 font-medium text-center w-10">
                          All
                        </th>
                        {ACTIONS.map((action) => (
                          <th
                            key={action.key}
                            className="pb-3 font-medium text-center"
                          >
                            {action.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moduleKeys.map((key) => {
                        const perms = modules[key] || EMPTY;
                        const allOn = ACTIONS.every(
                          (action) => Boolean(perms[action.key]),
                        );
                        return (
                          <tr
                            key={key}
                            className="border-t border-border/60 hover:bg-muted/30"
                          >
                            <td className="py-2.5 pr-4 text-sm font-medium text-foreground">
                              {moduleLabel(key)}
                            </td>
                            <td className="py-2.5 text-center">
                              <Checkbox
                                checked={allOn}
                                disabled={!canUpdate}
                                onCheckedChange={(value) =>
                                  toggleAll(key, Boolean(value))
                                }
                                aria-label={`Toggle all for ${moduleLabel(key)}`}
                              />
                            </td>
                            {ACTIONS.map((action) => (
                              <td
                                key={action.key}
                                className="py-2.5 text-center"
                              >
                                <Checkbox
                                  checked={Boolean(perms[action.key])}
                                  disabled={!canUpdate}
                                  onCheckedChange={(value) =>
                                    toggleAction(
                                      key,
                                      action.key,
                                      Boolean(value),
                                    )
                                  }
                                  aria-label={`${action.label} for ${moduleLabel(key)}`}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                  <Label className="text-sm text-muted-foreground">
                    {isSuperAdmin
                      ? "Super admin always has full access regardless of these."
                      : "Changes take effect immediately for that role."}
                  </Label>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4" />
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default Permissions;