import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid, isPast, isFuture } from "date-fns";
import { Plus, Pencil, Trash2, Tag, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useCurrencySymbol } from "@/lib/currency";

import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  type Coupon,
  type CreateCouponBody,
  type CouponType,
} from "@/store/api/couponApi";

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: "%",
  FIXED: "$",
  FREE_SHIPPING: "Free Ship",
  BUY_X_GET_Y: "BOGO",
};

function getCouponStatus(c: Coupon): "active" | "scheduled" | "expired" | "disabled" {
  if (!c.isActive) return "disabled";
  if (c.startDate && isFuture(parseISO(c.startDate))) return "scheduled";
  if (c.expiresAt && isPast(parseISO(c.expiresAt))) return "expired";
  if (c.maxUses && c.usedCount >= c.maxUses) return "expired";
  return "active";
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  scheduled: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
  expired: "bg-slate-100 text-slate-500 hover:bg-slate-100 border-slate-200",
  disabled: "bg-red-100 text-red-600 hover:bg-red-100 border-red-200",
};

const EMPTY_FORM: CreateCouponBody = {
  code: "",
  type: "PERCENTAGE",
  value: 0,
  minOrderAmount: null,
  maxUses: null,
  isActive: true,
  startDate: null,
  expiresAt: null,
  showInBanner: false,
  bannerTitle: "",
};

function toDate(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = parseISO(iso);
  return isValid(d) ? d : undefined;
}

function fromDate(d: Date | undefined): string | null {
  return d ? d.toISOString() : null;
}

// ── DatePicker ────────────────────────────────────────────────────────────────

interface DatePickerProps {
  value: string | null | undefined;
  onChange: (iso: string | null) => void;
  placeholder?: string;
}

function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  const selected = toDate(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => onChange(fromDate(d))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const Discounts = () => {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();

  const queryParams = {
    search: searchParams.get("search") ?? undefined,
    isActive: searchParams.get("isActive") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  };

  const { data, isFetching } = useGetCouponsQuery(queryParams);
  const coupons = data?.data ?? [];
  const pagination = data?.pagination;

  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CreateCouponBody>(EMPTY_FORM);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditTarget(c);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      maxUses: c.maxUses,
      isActive: c.isActive,
      startDate: c.startDate,
      expiresAt: c.expiresAt,
      showInBanner: c.showInBanner,
      bannerTitle: c.bannerTitle ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        bannerTitle: form.bannerTitle || null,
      };
      if (editTarget) {
        await updateCoupon({ id: editTarget.id, ...payload }).unwrap();
        toast({ title: "Coupon updated" });
      } else {
        await createCoupon(payload).unwrap();
        toast({ title: "Coupon created" });
      }
      setFormOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message ?? "Failed to save coupon.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoupon(deleteTarget.id).unwrap();
      toast({ title: "Coupon deleted", description: `"${deleteTarget.code}" removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete coupon.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────

  const activeCoupons = coupons.filter((c) => getCouponStatus(c) === "active").length;
  const totalUses = coupons.reduce((a, c) => a + c.usedCount, 0);
  const pctCoupons = coupons.filter((c) => c.type === "PERCENTAGE" && c.value > 0);
  const avgDiscount = pctCoupons.length
    ? Math.round(pctCoupons.reduce((a, c) => a + c.value, 0) / pctCoupons.length)
    : 0;

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns: DataTableColumn<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      filter: { type: "text", paramKey: "search", placeholder: "Search codes…" },
      cell: (row) => (
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-semibold tracking-wide">
            {row.code}
          </code>
          {row.showInBanner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center rounded bg-black px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Banner
                </span>
              </TooltipTrigger>
              <TooltipContent>{row.bannerTitle || row.code}</TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline" className="text-xs">
          {TYPE_LABELS[row.type]}
        </Badge>
      ),
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      cell: (row) =>
        row.type === "PERCENTAGE" || row.type === "BUY_X_GET_Y"
          ? <span className="font-medium text-sm">{row.value}%</span>
          : row.type === "FIXED"
          ? <span className="font-medium text-sm">{symbol}{row.value}</span>
          : <span className="text-muted-foreground text-sm">—</span>,
    },
    {
      key: "minOrderAmount",
      header: "Min Order",
      cell: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.minOrderAmount ? `${symbol}${row.minOrderAmount}` : "—"}
        </span>
      ),
    },
    {
      key: "usedCount",
      header: "Usage",
      sortable: true,
      cell: (row) => {
        const max = row.maxUses ?? 0;
        const pct = max > 0 ? Math.min((row.usedCount / max) * 100, 100) : 0;
        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{row.usedCount.toLocaleString()}</span>
              <span>{max > 0 ? max.toLocaleString() : "∞"}</span>
            </div>
            {max > 0 && <Progress value={pct} className="h-1.5" />}
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "Status",
      filter: { type: "boolean", paramKey: "isActive", placeholder: "All" },
      cell: (row) => {
        const status = getCouponStatus(row);
        return (
          <Badge className={`text-xs ${STATUS_BADGE[status]}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      cell: (row) => {
        const d = row.startDate ? parseISO(row.startDate) : null;
        return d && isValid(d) ? (
          <span className="text-xs text-muted-foreground tabular-nums">{format(d, "MMM d, yyyy")}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      key: "expiresAt",
      header: "Expiry Date",
      sortable: true,
      cell: (row) => {
        const d = row.expiresAt ? parseISO(row.expiresAt) : null;
        return d && isValid(d) ? (
          <span className={`text-xs tabular-nums ${isPast(d) ? "text-destructive" : "text-muted-foreground"}`}>
            {format(d, "MMM d, yyyy")}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "90px",
      headerClassName: "text-right pr-4",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts & Coupons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage discount codes and promotions
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pagination?.total ?? coupons.length}</p>
            <p className="text-xs text-muted-foreground">{activeCoupons} currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Uses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUses.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Discount Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgDiscount}%</p>
            <p className="text-xs text-muted-foreground">Percentage coupons only</p>
          </CardContent>
        </Card>
      </div>

      <DataTable<Coupon>
        columns={columns}
        data={coupons}
        loading={isFetching}
        rowKey={(row) => row.id}
        pagination={pagination}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Coupon
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-6">
            <Tag className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No coupons yet</p>
            <p className="text-xs text-muted-foreground">
              Create discount codes to boost your sales
            </p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-1 gap-1.5">
              <Plus className="h-4 w-4" />
              New Coupon
            </Button>
          </div>
        }
      />

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            <DialogDescription>
              {editTarget ? `Editing ${editTarget.code}` : "Add a new discount code"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as CouponType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>
                  Value{" "}
                  {form.type === "PERCENTAGE" || form.type === "BUY_X_GET_Y" ? "(%)" : form.type === "FIXED" ? `(${symbol})` : ""}
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: +e.target.value })}
                  disabled={form.type === "FREE_SHIPPING"}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Order ({symbol})</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.minOrderAmount ?? ""}
                  placeholder="None"
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? +e.target.value : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxUses ?? ""}
                  placeholder="Unlimited"
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value ? +e.target.value : null })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  value={form.startDate}
                  onChange={(iso) => setForm({ ...form, startDate: iso })}
                  placeholder="Pick start date"
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <DatePicker
                  value={form.expiresAt}
                  onChange={(iso) => setForm({ ...form, expiresAt: iso })}
                  placeholder="Pick expiry date"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Enable or disable this coupon</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show in Announcement Bar</p>
                  <p className="text-xs text-muted-foreground">
                    Display this coupon in the top banner on the storefront
                  </p>
                </div>
                <Switch
                  checked={form.showInBanner}
                  onCheckedChange={(v) => setForm({ ...form, showInBanner: v })}
                />
              </div>
              {form.showInBanner && (
                <div className="space-y-2">
                  <Label>Banner Message</Label>
                  <Input
                    value={form.bannerTitle ?? ""}
                    onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                    placeholder={`Use code ${form.code || "CODE"} for a discount!`}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {editTarget ? (updating ? "Saving…" : "Save Changes") : (creating ? "Creating…" : "Create Coupon")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.code}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Discounts;
