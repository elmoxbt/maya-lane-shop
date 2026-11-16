"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Truck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { addTracking, updateOrderStatus } from "@/server/actions/admin/orders";

type Props = { order: { id: string; status: string; hasPhysical: boolean; trackingCarrier: string | null; trackingNumber: string | null; canRefund: boolean } };
const carriers = ["USPS", "UPS", "FedEx", "DHL"] as const;

export function OrderActions({ order }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(order.status);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [carrier, setCarrier] = useState<(typeof carriers)[number]>((carriers.find((c) => c.toUpperCase() === order.trackingCarrier?.toUpperCase()) ?? "USPS") as (typeof carriers)[number]);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [notify, setNotify] = useState(true);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const locked = ["REFUNDED", "CANCELLED", "PENDING"].includes(order.status);

  function applyStatus(next: string) {
    start(async () => {
      const res = await updateOrderStatus({ orderId: order.id, status: next });
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.error);
        setStatus(order.status);
      }
    });
  }

  function saveTracking(e: React.FormEvent) {
    e.preventDefault();
    setTrackingError(null);
    start(async () => {
      const res = await addTracking({ orderId: order.id, carrier, trackingNumber: tracking, notify });
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        setTrackingError(res.fieldErrors?.trackingNumber?.[0] ?? res.error);
        toast.error(res.error);
      }
    });
  }

  const options = order.hasPhysical ? ["PAID", "SHIPPED", "DELIVERED", "REFUNDED"] : ["PAID", "DELIVERED", "REFUNDED"];

  return (
    <>
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Status</h2>
        <div className="mt-3 flex items-center gap-2">
          <Select
            value={status}
            disabled={locked || pending}
            onValueChange={(v) => {
              setStatus(v);
              if (v === "REFUNDED") setConfirmRefund(true);
              else applyStatus(v);
            }}
          >
            <SelectTrigger className="h-10! w-full" aria-label="Order status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(locked ? [order.status] : options).map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />}
        </div>
        {locked && <p className="mt-2 text-xs text-muted-foreground">This order is {order.status.toLowerCase()} and can no longer change.</p>}
      </section>

      {order.hasPhysical && !locked && (
        <form onSubmit={saveTracking} className="space-y-3 rounded-2xl border bg-white p-5" noValidate>
          <h2 className="flex items-center gap-2 font-semibold">
            <Truck className="size-4" aria-hidden /> Shipping
          </h2>
          <div className="grid grid-cols-[110px_1fr] gap-2">
            <Select value={carrier} onValueChange={(v) => setCarrier(v as (typeof carriers)[number])}>
              <SelectTrigger className="h-10! w-full" aria-label="Carrier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Label htmlFor="tracking" className="sr-only">
                Tracking number
              </Label>
              <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number" className="h-10 font-mono" aria-invalid={Boolean(trackingError)} aria-describedby={trackingError ? "tracking-error" : undefined} />
            </div>
          </div>
          {trackingError && (
            <p id="tracking-error" role="alert" className="text-sm text-destructive">
              {trackingError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Checkbox id="notify" checked={notify} onCheckedChange={(c) => setNotify(c === true)} />
            <Label htmlFor="notify" className="text-sm font-normal">
              Email the customer their tracking link
            </Label>
          </div>
          <Button type="submit" disabled={pending || !tracking} className="h-10 w-full rounded-full">
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {order.trackingNumber ? "Update tracking" : "Save & mark shipped"}
          </Button>
        </form>
      )}

      <AlertDialog
        open={confirmRefund}
        onOpenChange={(o) => {
          setConfirmRefund(o);
          if (!o) setStatus(order.status);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund this order?</AlertDialogTitle>
            <AlertDialogDescription>
              {order.canRefund ? "This issues a full refund through Stripe and revokes download access. It can't be undone." : "This marks the order refunded and revokes download access. It can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setConfirmRefund(false);
                applyStatus("REFUNDED");
              }}
            >
              Refund order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
