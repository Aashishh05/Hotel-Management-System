import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Log out",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !busy) onCancel?.();
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <LogOut className="size-5" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={busy}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1"
          >
            {busy ? "Logging out…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;