import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Trash2,
  Coffee,
  Search,
  Import,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../api/menuApi";
import { searchMeals } from "../../api/mealDbApi";
import { showToast } from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import { Checkbox } from "../../components/ui/checkbox";
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

const CATEGORIES = ["starter", "main", "dessert", "drinks", "snacks"];
const FILTERS = ["all", ...CATEGORIES];
const MEALDB = "TheMealDB";

const CATEGORY_LABELS = {
  starter: "Starter",
  main: "Main Course",
  dessert: "Dessert",
  drinks: "Drinks",
  snacks: "Snacks",
};

const AVAILABILITY_STYLES = {
  available: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  unavailable: "text-muted-foreground bg-muted/40 border-border",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const menuItemSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .required("Name is required"),
  category: Yup.string()
    .oneOf(CATEGORIES, "Invalid category")
    .required("Category is required"),
  price: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  description: Yup.string()
    .max(500, "Description cannot exceed 500 characters"),
});

const mapMealCategory = (mealCategory) => {
  const category = (mealCategory || "").toLowerCase();

  if (category === "dessert") return "dessert";
  if (category === "starter") return "starter";
  if (["breakfast", "side", "miscellaneous", "pasta"].includes(category)) {
    return "snacks";
  }

  return "main";
};

const truncate = (text, max = 300) =>
  text ? text.replace(/\s+/g, " ").trim().slice(0, max) : "";

const StatCard = ({ label, value, Icon }) => (
  <Card>
    <CardContent className="py-3 flex items-center gap-3">
      <div className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-none tracking-tight">
          {value}
        </p>
      </div>
    </CardContent>
  </Card>
);

const Menu = () => {
  const { permissions } = useSelector((state) => state.permission);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [formTarget, setFormTarget] = useState(null);
  const [importPrefill, setImportPrefill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importQuery, setImportQuery] = useState("");
  const [importResults, setImportResults] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importSearched, setImportSearched] = useState(false);

  const menuPerm = permissions?.modules?.menu;
  const canCreate = menuPerm?.create === true;
  const canUpdate = menuPerm?.update === true;
  const canDelete = menuPerm?.delete === true;

  const loadMenu = async () => {
    try {
      const res = await getAllMenuItems();
      setItems(res?.menuItems || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const isCreate = formTarget === "new";
  const targetItem = isCreate ? null : formTarget;

  const closeForm = () => {
    setFormTarget(null);
    setImportPrefill(null);
  };

  const openCreate = () => {
    setImportPrefill(null);
    setFormTarget("new");
  };

  const openEdit = (item) => {
    setImportPrefill(null);
    setFormTarget(item);
  };

  const applyImportedMeal = (meal) => {
    setImportPrefill({
      name: meal.strMeal,
      category: mapMealCategory(meal.strCategory),
      description: truncate(meal.strInstructions),
    });
    setImportOpen(false);
    setFormTarget("new");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = importQuery.trim();

    if (!query) return;

    setImportLoading(true);
    setImportSearched(true);
    try {
      const meals = await searchMeals(query);
      setImportResults(meals);
    } catch (err) {
      setImportResults([]);
      showToast({ type: "error", message: err?.message || "Search failed" });
    } finally {
      setImportLoading(false);
    }
  };

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: importPrefill?.name || targetItem?.name || "",
      category: importPrefill?.category || targetItem?.category || "main",
      price: targetItem?.price ?? "",
      description: importPrefill?.description || targetItem?.description || "",
      isAvailable: targetItem?.isAvailable ?? true,
    },
    validationSchema: menuItemSchema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name.trim(),
        category: values.category,
        price: Number(values.price),
        description: values.description.trim() || undefined,
        isAvailable: Boolean(values.isAvailable),
      };

      try {
        setSaving(true);
        if (isCreate) {
          const res = await createMenuItem(payload);
          setItems((prev) => [res?.menuItem, ...prev].filter(Boolean));
          closeForm();
          showToast({ type: "success", message: "Menu item added successfully" });
        } else {
          const res = await updateMenuItem(targetItem._id, payload);
          setItems((prev) =>
            prev.map((item) => (item._id === targetItem._id ? res?.menuItem : item)),
          );
          closeForm();
          showToast({ type: "success", message: "Menu item updated successfully" });
        }
      } catch (err) {
        showToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            (isCreate ? "Could not add menu item" : "Could not update menu item"),
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
      await deleteMenuItem(confirmDelete._id);
      setItems((prev) => prev.filter((item) => item._id !== confirmDelete._id));
      setConfirmDelete(null);
      showToast({ type: "success", message: "Menu item deleted successfully" });
    } catch (err) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Could not delete menu item",
      });
    } finally {
      setDeleting(false);
    }
  };

  const f = form;
  const visibleItems =
    activeFilter === "all"
      ? items
      : items.filter((item) => item.category === activeFilter);

  const availabilityCount = (available) =>
    items.filter((item) => Boolean(item.isAvailable) === available).length;

  const stats = [
    { label: "Total Items", value: items.length, Icon: Coffee },
    {
      label: "Available",
      value: availabilityCount(true),
      Icon: UtensilsCrossed,
    },
    { label: "Unavailable", value: availabilityCount(false), Icon: Search },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-foreground">Menu</h1>
          <p className="text-sm text-muted-foreground">
            Manage the hotel restaurant menu. Import dishes from the open{" "}
            {MEALDB} API or add them manually.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Import className="w-4 h-4" />
                Import from API
              </Button>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4" />
                Add item
              </Button>
            </>
          )}
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
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
            {filter === "all" ? "All" : CATEGORY_LABELS[filter]}
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

      <Card className="animate-fade-in-up animate-delay-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
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
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : visibleItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canUpdate || canDelete ? 5 : 4}
                  className="py-14 text-center"
                >
                  <Coffee className="mx-auto w-9 h-9 text-primary" />
                  <p className="mt-3 font-display text-lg text-foreground">
                    No menu items here yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeFilter === "all"
                      ? "Add your first dish or import one from the open API."
                      : `No items in the "${CATEGORY_LABELS[activeFilter]}" category.`}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item) => (
                <TableRow key={item._id} className="animate-fade-in-up">
                  <TableCell>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.description && (
                      <p className="max-w-md truncate text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    ${Number(item.price).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.isAvailable
                          ? AVAILABILITY_STYLES.available
                          : AVAILABILITY_STYLES.unavailable
                      }
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(item)}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import from open API</DialogTitle>
            <DialogDescription>
              Search dishes on {MEALDB} (free public recipe API) and use them to
              fill the menu form. You can adjust the details before saving.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={importQuery}
                onChange={(e) => setImportQuery(e.target.value)}
                placeholder="Search a dish, e.g. chicken curry"
                disabled={importLoading}
              />
              <Button type="submit" disabled={importLoading}>
                {importLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>
          </form>

          {importLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!importLoading && importSearched && importResults.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No dishes found for "{importQuery}". Try another search.
            </p>
          )}

          {importResults.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {importResults.map((meal) => (
                <div
                  key={meal.idMeal}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                >
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="h-12 w-12 shrink-0 rounded object-cover bg-muted"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {meal.strMeal}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meal.strCategory || "Uncategorised"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyImportedMeal(meal)}
                  >
                    Use this dish
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && closeForm()}
      >
        {formTarget !== null && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isCreate ? "Add menu item" : `Edit ${targetItem?.name}`}
              </DialogTitle>
              <DialogDescription>
                {isCreate
                  ? "Fill in the details to add a new dish."
                  : "Update the dish details below."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit}
              noValidate
              className="space-y-4"
              id="menu-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isCreate && importPrefill && (
                  <div className="sm:col-span-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                    Details imported from {MEALDB}. Review and adjust before
                    saving.
                  </div>
                )}

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-name">Name</Label>
                  <Input
                    id="f-name"
                    name="name"
                    value={f.values.name}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="Butter Chicken"
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
                  <Label htmlFor="f-category">Category</Label>
                  <Select
                    value={f.values.category}
                    onValueChange={(value) => f.setFieldValue("category", value)}
                    items={Object.fromEntries(
                      CATEGORIES.map((category) => [
                        category,
                        CATEGORY_LABELS[category],
                      ])
                    )}
                  >
                    <SelectTrigger id="f-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="f-price">Price</Label>
                  <Input
                    id="f-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={f.values.price}
                    onChange={f.handleChange}
                    onBlur={f.handleBlur}
                    disabled={saving}
                    placeholder="15.00"
                    aria-invalid={
                      f.submitCount > 0 && f.errors.price ? true : undefined
                    }
                    className={
                      f.submitCount > 0 && f.errors.price ? "aria-invalid" : ""
                    }
                  />
                  {f.submitCount > 0 && f.errors.price && (
                    <p className={errorClass}>{f.errors.price}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="f-description">Description</Label>
                  <textarea
                    id="f-description"
                    name="description"
                    value={f.values.description}
                    onChange={f.handleChange}
                    disabled={saving}
                    rows={3}
                    placeholder="Optional description of the dish"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                  />
                  {f.submitCount > 0 && f.errors.description && (
                    <p className={errorClass}>{f.errors.description}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Separator />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <Checkbox
                    id="f-isAvailable"
                    checked={Boolean(f.values.isAvailable)}
                    onCheckedChange={(value) =>
                      f.setFieldValue("isAvailable", Boolean(value))
                    }
                    disabled={saving}
                  />
                  <Label
                    htmlFor="f-isAvailable"
                    className="font-normal text-sm text-foreground"
                  >
                    Available to guests
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
              <Button type="submit" form="menu-form" disabled={saving}>
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Add item"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete menu item"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Menu;