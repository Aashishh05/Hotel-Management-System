import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
} from "../../api/roleApi";
import { getAllUsers } from "../../api/userApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
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

const errorClass = "mt-1.5 text-xs text-destructive";

const ROLE_NAME_PATTERN = /^[a-z0-9-]+$/;

const roleSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(20, "Role name cannot exceed 20 characters")
    .matches(
      ROLE_NAME_PATTERN,
      "Only lowercase letters, numbers and hyphens are allowed",
    )
    .required("Role name is required"),
  displayName: Yup.string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name cannot exceed 50 characters")
    .required("Display name is required"),
  description: Yup.string()
    .trim()
    .max(100, "Description cannot exceed 100 characters"),
});

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Roles = () => {
  const { user: me } = useAuth();
  const { permissions } = useSelector((state) => state.permission);

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const roleName = me?.role?.name;
  const isSuperAdmin = roleName === "superadmin";
  const rolesPerm = permissions?.modules?.roles;
  const canCreate = isSuperAdmin || rolesPerm?.create === true;
  const canUpdate = isSuperAdmin || rolesPerm?.update === true;
  const canDelete = isSuperAdmin || rolesPerm?.delete === true;

  const loadRoles = async () => {
    try {
      const res = await getAllRoles();
      setRoles(res?.roles || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    let active = true;
    getAllUsers()
      .then((res) => active && setUsers(res?.users || []))
      .catch(() => active && setUsers([]));
    return () => {
      active = false;
    };
  }, []);

  const countByRole = useMemo(() => {
    const counts = new Map();
    users.forEach((user) => {
      const roleId = user.role?._id;
      if (roleId) counts.set(roleId, (counts.get(roleId) || 0) + 1);
    });
    return counts;
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (role) =>
        role.name?.toLowerCase().includes(q) ||
        role.displayName?.toLowerCase().includes(q) ||
        role.description?.toLowerCase().includes(q),
    );
  }, [roles, query]);

  const isCreate = formTarget === "new";
  const targetRole = isCreate ? null : formTarget;

  const openCreate = () => setFormTarget("new");
  const openEdit = (role) => setFormTarget(role);
  const closeForm = () => setFormTarget(null);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: targetRole?.name || "",
      displayName: targetRole?.displayName || "",
      description: targetRole?.description || "",
    },
    validationSchema: roleSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const payload = {
          name: values.name.trim().toLowerCase(),
          displayName: values.displayName.trim(),
        };
        if (values.description?.trim()) {
          payload.description = values.description.trim();
        }

        if (isCreate) {
          await createRole(payload);
          setFormTarget(null);
          loadRoles();
          showToast({ type: "success", message: "Role created successfully" });
        } else {
          const res = await updateRole(targetRole._id, payload);
          setRoles((prev) =>
            prev.map((role) =>
              role._id === targetRole._id ? res?.role : role,
            ),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "Role updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not create role" : "Could not update role"),
        });
      } finally {
        setSaving(false);
      }
    },
  });

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteRole(confirmDelete._id);
      setRoles((prev) =>
        prev.filter((role) => role._id !== confirmDelete._id),
      );
      setConfirmDelete(null);
      showToast({ type: "success", message: "Role deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete role",
      });
    } finally {
      setDeleting(false);
    }
  };

  const f = form;
  const editingLabel = isCreate ? "Add role" : `Edit ${targetRole?.displayName || "role"}`;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Define the staff roles used across the hotel.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add role
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <CardContent className="py-6 px-0">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or description…"
          className="sm:max-w-xs"
          aria-label="Search roles"
        />
      </div>

      <Card className="animate-fade-in-up animate-delay-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead className="text-center w-24">Users</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              {(canUpdate || canDelete) && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-center w-24">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
<TableCell colSpan={canUpdate || canDelete ? 4 : 3} className="py-14 text-center">
                  <Shield className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No roles found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {roles.length === 0
                      ? "Add your first role using the Add role button."
                      : "Try adjusting your search."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((role) => {
                const isSystem = Boolean(role.isSystem);
                return (
                  <TableRow
                    key={role._id}
                    className="animate-fade-in-up transition-colors hover:bg-muted/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {role.name?.[0]?.toUpperCase() || "R"}
                        </div>
                        <div>
                          <p className="flex items-center gap-2 font-semibold text-foreground">
                            {role.displayName}
                            {isSystem && (
                              <Badge variant="secondary" className="h-5">
                                System
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {role.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap px-6">
                      <Badge variant="secondary">
                        {countByRole.get(role._id) || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(role.createdAt) || "—"}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-600"
                            onClick={() => openEdit(role)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={isSystem}
                            title={
                              isSystem
                                ? "System roles cannot be deleted"
                                : `Delete role ${role.displayName}`
                            }
                            onClick={() => setConfirmDelete(role)}
                            aria-label={`Delete role ${role.displayName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && closeForm()}
      >
        {formTarget !== null && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLabel}</DialogTitle>
              <DialogDescription>
                {isCreate
                  ? "Fill in the details to create a new role."
                  : "Update the role details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="role-form"
            >
              <div className="space-y-2">
                <Label htmlFor="f-displayName">Display name</Label>
                <Input
                  id="f-displayName"
                  name="displayName"
                  value={f.values.displayName}
                  onChange={f.handleChange}
                  onBlur={f.handleBlur}
                  disabled={saving}
                  placeholder="Front Desk"
                  aria-invalid={
                    f.submitCount > 0 && f.errors.displayName ? true : undefined
                  }
                  className={
                    f.submitCount > 0 && f.errors.displayName
                      ? "aria-invalid"
                      : ""
                  }
                />
                {f.submitCount > 0 && f.errors.displayName && (
                  <p className={errorClass}>{f.errors.displayName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="f-name">Role name</Label>
                <Input
                  id="f-name"
                  name="name"
                  value={f.values.name}
                  onChange={f.handleChange}
                  onBlur={f.handleBlur}
                  disabled={saving || !isCreate}
                  placeholder="front-desk"
                  aria-invalid={
                    f.submitCount > 0 && f.errors.name ? true : undefined
                  }
                  className={
                    f.submitCount > 0 && f.errors.name ? "aria-invalid" : ""
                  }
                />
                {!isCreate ? (
                  <p className="text-xs text-muted-foreground">
                    Role name cannot be changed after creation.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Lowercase, numbers and hyphens only. This is used
                    internally.
                  </p>
                )}
                {f.submitCount > 0 && f.errors.name && (
                  <p className={errorClass}>{f.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="f-description">Description</Label>
                <Input
                  id="f-description"
                  name="description"
                  value={f.values.description}
                  onChange={f.handleChange}
                  onBlur={f.handleBlur}
                  disabled={saving}
                  placeholder="Handles check-ins, bookings and guest requests"
                  aria-invalid={
                    f.submitCount > 0 && f.errors.description ? true : undefined
                  }
                  className={
                    f.submitCount > 0 && f.errors.description
                      ? "aria-invalid"
                      : ""
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Max 100 characters.
                </p>
                {f.submitCount > 0 && f.errors.description && (
                  <p className={errorClass}>{f.errors.description}</p>
                )}
              </div>
            </form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" form="role-form" disabled={saving}>
                {saving ? "Saving…" : isCreate ? "Create role" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete role"
        message={`Are you sure you want to delete ${confirmDelete?.displayName}? Any users assigned to it will need a new role.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Roles;