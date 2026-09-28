import { useFormik } from "formik";
import * as Yup from "yup";
import { Wrench } from "lucide-react";
import { reportIssue } from "../../api/maintenanceApi";
import { showToast } from "../../components/common/Toast";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const errorClass = "mt-1.5 text-xs text-destructive";

const ReportIssueDialog = ({ open, onOpenChange, room, onReported }) => {
  const form = useFormik({
    enableReinitialize: true,
    initialValues: { issue: "" },
    validationSchema: Yup.object({
      issue: Yup.string()
        .trim()
        .min(3, "Please describe the issue (at least 3 characters)")
        .max(1000, "Issue cannot exceed 1000 characters")
        .required("Please describe the issue"),
    }),
    onSubmit: async (values, formik) => {
      try {
        await reportIssue({ room: room?._id, issue: values.issue.trim() });
        showToast({ type: "success", message: "Issue reported successfully" });
        formik.resetForm();
        onOpenChange(false);
        onReported?.();
      } catch (err) {
        showToast({
          type: "error",
          message: err?.response?.data?.message || "Could not submit report",
        });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            Report an issue
          </DialogTitle>
          <DialogDescription>
            Tell us what's wrong and the maintenance team will take care of it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Room <span className="font-semibold text-foreground">{room?.number}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-issue">What's the problem?</Label>
            <Textarea
              id="report-issue"
              name="issue"
              value={form.values.issue}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              rows={4}
              placeholder="e.g. the AC isn't cooling in my room"
              aria-invalid={form.errors.issue ? true : undefined}
            />
            {form.errors.issue && (
              <p className={errorClass}>{form.errors.issue}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form
            onClick={form.handleSubmit}
            disabled={form.isSubmitting || !form.values.issue.trim()}
          >
            {form.isSubmitting ? "Submitting…" : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueDialog;