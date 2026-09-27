import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { createUser, getAllUsers, updateUser, deleteUser } from "../../api/userApi";
import { getAllRoles } from "../../api/roleApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const errorClass = "mt-1.5 text-xs text-destructive";

const PHONE_PATTERN = /^(97|98)\d{8}$/;

const buildUserSchema = (isCreate) => {
  const schema = {
    name: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .required("Name is required"),
    email: Yup.string()
      .trim()
      .email("Please provide a valid email address")
      .required("Email is required"),
    role: Yup.string().required("Role is required"),
    phone: Yup.string()
      .trim()
      .transform((value, original) => (original === "" ? undefined : value))
      .matches(PHONE_PATTERN, "Enter a valid 10-digit mobile number starting with 97 or 98"),
  };

  if (isCreate) {
    schema.password = Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required");
  } else {
    schema.password = Yup.string().min(8, "Password must be at least 8 characters");
  }

  return Yup.object(schema);
};

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

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?";

const Users = () => {
  const { user: me } = useAuth();
  const { permissions } = useSelector((state) => state.permission);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const usersPerm = permissions?.modules?.users;
  const canCreate = usersPerm?.create === true;
  const canUpdate = usersPerm?.update === true;
  const canDelete = usersPerm?.delete === true;

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res?.users || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let active = true;
    getAllRoles()
      .then((res) => active && setRoles(res?.roles || []))
      .catch(() => active && setRoles([]));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && user.role?._id !== roleFilter) return false;
      if (!q) return true;
      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const isCreate = formTarget === "new";
  const targetUser = isCreate ? null : formTarget;

  const openCreate = () => setFormTarget("new");
  const openEdit = (user) => setFormTarget(user);
  const closeForm = () => setFormTarget(null);

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: targetUser?.name || "",
      email: targetUser?.email || "",
      role: targetUser?.role?._id || "",
      phone: targetUser?.phone || "",
      isActive: targetUser?.isActive ?? true,
      password: "",
    },
    validationSchema: buildUserSchema(isCreate),
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const payload = {
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          isActive: Boolean(values.isActive),
        };
        if (values.phone?.trim()) payload.phone = values.phone.trim();
        if (values.password) payload.password = values.password;

        if (isCreate) {
          await createUser(payload);
          setFormTarget(null);
          loadUsers();
          showToast({ type: "success", message: "User created successfully" });
        } else {
          const res = await updateUser(targetUser._id, payload);
          setUsers((prev) =>
            prev.map((user) =>
              user._id === targetUser._id ? res?.user : user,
            ),
          );
          setFormTarget(null);
          showToast({ type: "success", message: "User updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not create user" : "Could not update user"),
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
      await deleteUser(confirmDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== confirmDelete._id));
      setConfirmDelete(null);
      showToast({ type: "success", message: "User deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete user",
      });
    } finally {
      setDeleting(false);
    }
  };

  const f = form;
  const editingLabel = isCreate ? "Add user" : `Edit ${targetUser?.name || "user"}`;

  const roleOptions = [...roles].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts and the teams they belong to.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add user
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
          placeholder="Search by name, email or phone…"
          className="sm:max-w-xs"
          aria-label="Search users"
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value || "")}
        >
          <SelectTrigger id="f-roleFilter" className="w-full sm:w-56">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role._id} value={role._id}>
                {role.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="animate-fade-in-up animate-delay-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
              {(canUpdate || canDelete) && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
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
                <TableCell
                  colSpan={canUpdate || canDelete ? 6 : 5}
                  className="py-14 text-center"
                >
                  <UsersIcon className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No users found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {users.length === 0
                      ? "Add your first staff account using the Add user button."
                      : "Try adjusting your search or role filter."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => {
                const isSelf = user._id === me?._id;
                return (
                  <TableRow
                    key={user._id}
                    className="cursor-pointer animate-fade-in-up transition-colors hover:bg-muted/40"
                    onClick={() => navigate(`/users/${user._id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            <Link
                              to={`/users/${user._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-foreground hover:text-primary hover:underline"
                            >
                              {user.name}
                            </Link>
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.role?.displayName || user.role?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.lastLogin) || "Never"}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-600"
                            disabled={isSelf}
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={isSelf}
                            onClick={() => setConfirmDelete(user)}
                            aria-label={`Delete user ${user.name}`}
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
                  ? "Fill in the details to create a new staff account."
                  : "Update the account details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="user-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-name">Full name</Label>
                  <Input
                    id="f-name"
                    name="name"
                    value={f.values.name}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="John Smith"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.name ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.name ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.name && (
                    <p className={errorClass}>{f.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-email">Email</Label>
                  <Input
                    id="f-email"
                    name="email"
                    type="email"
                    value={f.values.email}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="john@example.com"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.email ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.email ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.email && (
                    <p className={errorClass}>{f.errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-role">Role</Label>
                  <Select
                    value={f.values.role}
                    onValueChange={(value) => f.setFieldValue("role", value)}
                  >
                    <SelectTrigger id="f-role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {f.submitCount > 0 && f.errors.role && (
                    <p className={errorClass}>{f.errors.role}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-phone">Phone</Label>
                  <Input
                    id="f-phone"
                    name="phone"
                    value={f.values.phone}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="9812345678"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.phone ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.phone ? "aria-invalid" : ""
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional 10-digit mobile number starting with 97 or 98.
                  </p>
                  {f.submitCount > 0 && f.errors.phone && (
                    <p className={errorClass}>{f.errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-password">
                    {isCreate ? "Password" : "New password"}
                  </Label>
                  <Input
                    id="f-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={f.values.password}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="At least 8 characters"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.password ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.password
                        ? "aria-invalid"
                        : ""
                    }
                  />
                  {isCreate ? (
                    f.submitCount > 0 && f.errors.password && (
                      <p className={errorClass}>{f.errors.password}</p>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep the current password.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <Checkbox
                    id="f-isActive"
                    checked={Boolean(f.values.isActive)}
                    onCheckedChange={(value) =>
                      f.setFieldValue("isActive", Boolean(value))
                    }
                    disabled={saving}
                  />
                  <Label
                    htmlFor="f-isActive"
                    className="font-normal text-sm text-foreground"
                  >
                    Account is active
                  </Label>
                </div>
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
              <Button type="submit" form="user-form" disabled={saving}>
                {saving ? "Saving…" : isCreate ? "Create user" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete user"
        message={`Are you sure you want to delete ${confirmDelete?.name}? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Users;