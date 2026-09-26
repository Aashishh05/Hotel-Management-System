import * as Yup from "yup";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
};

const STATUS_BADGE = {
  pending: "bg-amber-500/10 text-amber-600 border-transparent",
  confirmed: "bg-sky-500/10 text-sky-600 border-transparent",
  "checked-in": "bg-emerald-500/10 text-emerald-600 border-transparent",
  "checked-out": "bg-slate-500/10 text-slate-600 border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
};

const ROOM_TYPE_LABELS = {
  single: "Single",
  double: "Double",
  suite: "Suite",
  deluxe: "Deluxe",
};

const ID_TYPES = ["passport", "citizenship", "drivers-license"];

const ID_TYPE_LABELS = {
  passport: "Passport",
  citizenship: "Citizenship",
  "drivers-license": "Driver's License",
};

const errorClass = "mt-1.5 text-xs text-destructive";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const nightCount = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 0;
  const diff =
    new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
  return Math.max(0, Math.round(diff / 86400000));
};

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const EMPTY_FORM_VALUES = {
  guest: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  idType: "",
  idNumber: "",
  room: "",
  checkInDate: "",
  checkOutDate: "",
  guestsCount: 1,
  status: "pending",
};

const buildBookingSchema = (isGuest) => {
  const schema = {
    guestName: Yup.string()
      .trim()
      .min(2, "Guest name must be at least 2 characters")
      .max(100, "Guest name cannot exceed 100 characters")
      .when("guest", {
        is: "__new",
        then: (s) => s.required("Guest name is required"),
      }),
    guestEmail: Yup.string()
      .trim()
      .transform((value, original) => (original === "" ? undefined : value))
      .email("Please provide a valid email address")
      .when("guest", {
        is: "__new",
        then: (s) => s,
      }),
    guestPhone: Yup.string()
      .trim()
      .transform((value, original) => (original === "" ? undefined : value))
      .matches(phoneRegex, "Please provide a valid phone number")
      .when("guest", {
        is: (value) => isGuest || value === "__new",
        then: (s) => s.required("Phone number is required"),
      }),
    room: Yup.string().required("Room is required"),
    checkInDate: Yup.string()
      .required("Check-in date is required")
      .test("not-past", "Check-in date cannot be in the past", (value) =>
        Boolean(value && value >= todayStr()),
      ),
    checkOutDate: Yup.string()
      .required("Check-out date is required")
      .test(
        "after-check-in",
        "Check-out must be after check-in",
        function (value) {
          return Boolean(
            value && this.parent.checkInDate && value > this.parent.checkInDate,
          );
        },
      ),
    guestsCount: Yup.number()
      .integer("Guest count must be a whole number")
      .min(1, "At least one guest is required")
      .max(20, "Guest count cannot exceed 20"),
    idType: Yup.string()
      .oneOf(ID_TYPES, "Invalid ID type")
      .when("guest", {
        is: (value) => isGuest || value === "__new",
        then: (s) => s.required("ID type is required"),
      }),
    idNumber: Yup.string()
      .trim()
      .max(50, "ID number cannot exceed 50 characters")
      .when("idType", {
        is: (value) => Boolean(value),
        then: (schema) => schema.required("ID number is required"),
      }),
  };

  if (!isGuest) {
    schema.guest = Yup.string().required("Guest is required");
    schema.status = Yup.string()
      .oneOf(["pending", "confirmed"], "Invalid status")
      .required("Status is required");
  }

  return Yup.object(schema);
};

export {
  STATUS_LABELS,
  STATUS_BADGE,
  ROOM_TYPE_LABELS,
  ID_TYPES,
  ID_TYPE_LABELS,
  errorClass,
  todayStr,
  formatDate,
  nightCount,
  phoneRegex,
  EMPTY_FORM_VALUES,
  buildBookingSchema,
};