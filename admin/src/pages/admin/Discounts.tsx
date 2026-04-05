import { useState } from "react";
import {
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
} from "@/store/api/mockApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2 } from "lucide-react";
import { Discount } from "@/store/api/mockData";

const statusColors: Record<string, string> = {
  active: "default",
  expired: "secondary",
  disabled: "destructive",
};
const typeLabels: Record<string, string> = {
  percentage: "%",
  fixed: "$",
  free_shipping: "Free Ship",
  buy_x_get_y: "BOGO",
};

const Discounts = () => {
  const { data: discounts, isLoading } = useGetDiscountsQuery();
  const [createDiscount] = useCreateDiscountMutation();
  const [deleteDiscount] = useDeleteDiscountMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Discount>>({
    code: "",
    type: "percentage",
    value: 0,
    minOrder: 0,
    maxUses: 100,
    status: "active",
    startDate: "",
    endDate: "",
  });

  const handleCreate = () => {
    createDiscount({ ...form, usedCount: 0 });
    setOpen(false);
    setForm({
      code: "",
      type: "percentage",
      value: 0,
      minOrder: 0,
      maxUses: 100,
      status: "active",
      startDate: "",
      endDate: "",
    });
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discounts & Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount codes and promotions
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Coupon
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {discounts?.filter((d) => d.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {discounts?.reduce((a, d) => a + d.usedCount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Avg Discount Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {discounts?.length
                ? Math.round(
                    discounts
                      .filter((d) => d.value > 0)
                      .reduce((a, d) => a + d.value, 0) /
                      discounts.filter((d) => d.value > 0).length,
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                      {d.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[d.type]}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {d.type === "percentage" || d.type === "buy_x_get_y"
                      ? `${d.value}%`
                      : d.type === "fixed"
                        ? `$${d.value}`
                        : "—"}
                  </TableCell>
                  <TableCell>${d.minOrder}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {d.usedCount}/{d.maxUses}
                      </div>
                      <Progress
                        value={(d.usedCount / d.maxUses) * 100}
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[d.status] as any}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.startDate}
                    <br />
                    {d.endDate}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDiscount(d.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>Add a new discount code</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: +e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Order ($)</Label>
                <Input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm({ ...form, minOrder: +e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: +e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discounts;
