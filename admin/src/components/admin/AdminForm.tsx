import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/store";
import {
  useCreateAdminMutation,
  useUpdateAdminMutation,
  type AdminUser,
} from "@/store/api/adminApi";

// ─── Schema ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

const editSchema = createSchema.extend({
  password: z.string().min(8).optional().or(z.literal("")),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;
type FormValues = CreateValues | EditValues;

// ─── Role descriptions for the UI ─────────────────────────────────────────────

const ROLE_INFO: Record<string, { label: string; description: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    description: "Full access — manages staff, settings, and all store data",
  },
  ADMIN: {
    label: "Store Manager",
    description: "Manages orders, customers, products, marketing, and themes — no staff or system settings",
  },
  EDITOR: {
    label: "Editor",
    description: "Manages products, categories, and blog content only — no financial or customer data",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: AdminUser | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminForm({ open, onOpenChange, admin }: AdminFormProps) {
  const { toast } = useToast();
  const isEdit = !!admin;
  const currentUser = useAppSelector((s) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "super_admin";

  const [showPassword, setShowPassword] = useState(false);
  const [createAdmin, { isLoading: creating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: updating }] = useUpdateAdminMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EDITOR",
      phone: "",
      isActive: true,
    },
  });

  const selectedRole = watch("role") as string;
  const isActive = watch("isActive");

  useEffect(() => {
    if (open && admin) {
      reset({
        name: admin.name,
        email: admin.email,
        password: "",
        role: admin.role,
        phone: admin.phone ?? "",
        isActive: admin.isActive,
      });
    } else if (open && !admin) {
      reset({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
        phone: "",
        isActive: true,
      });
    }
    setShowPassword(false);
  }, [open, admin, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && admin) {
        const payload: Record<string, unknown> = { ...values };
        if (!payload.password) delete payload.password;
        await updateAdmin({ id: admin.id, ...payload }).unwrap();
        toast({ title: "Admin updated", description: `"${values.name}" saved.` });
      } else {
        await createAdmin(values as CreateValues).unwrap();
        toast({ title: "Admin created", description: `"${values.name}" can now log in.` });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const isBusy = creating || updating;
  const roleInfo = ROLE_INFO[selectedRole];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Admin" : "Add New Admin"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <ScrollArea className="h-[calc(80vh-10rem)]">
            <div className="px-6 py-5 space-y-5">

              {/* Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="admin-name" {...register("name")} placeholder="Jane Smith" />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="admin-email" type="email" {...register("email")} placeholder="jane@store.com" />
                  {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">
                  Password {!isEdit && <span className="text-destructive">*</span>}
                  {isEdit && <span className="text-muted-foreground text-xs ml-1">(leave blank to keep current)</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder={isEdit ? "Enter new password…" : "Min 8 characters"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-phone">Phone</Label>
                <Input id="admin-phone" {...register("phone")} placeholder="+1 555 000 0000" />
              </div>

              <Separator />

              {/* Role */}
              <div className="space-y-2">
                <Label>
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setValue("role", v as FormValues["role"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperAdmin && (
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    )}
                    <SelectItem value="ADMIN">Store Manager (Admin)</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <FieldError>{errors.role.message}</FieldError>}

                {/* Role permission summary */}
                {roleInfo && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                    <p className="font-medium text-xs">{roleInfo.label}</p>
                    <p className="text-xs text-muted-foreground">{roleInfo.description}</p>
                    <PermissionPills role={selectedRole} />
                  </div>
                )}
              </div>

              <Separator />

              {/* Active toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">Active account</p>
                  <p className="text-xs text-muted-foreground">Inactive admins cannot log in</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="min-w-[130px]">
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Admin"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Permission pill summary ──────────────────────────────────────────────────

const ROLE_PILLS: Record<string, { label: string; has: boolean }[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard + Revenue", has: true },
    { label: "Orders", has: true },
    { label: "Users", has: true },
    { label: "Staff Management", has: true },
    { label: "Marketing", has: true },
    { label: "Theme", has: true },
    { label: "Settings", has: true },
  ],
  ADMIN: [
    { label: "Dashboard + Revenue", has: true },
    { label: "Orders", has: true },
    { label: "Users", has: true },
    { label: "Staff Management", has: false },
    { label: "Marketing", has: true },
    { label: "Theme", has: true },
    { label: "Settings", has: false },
  ],
  EDITOR: [
    { label: "Dashboard + Revenue", has: false },
    { label: "Orders", has: false },
    { label: "Users", has: false },
    { label: "Staff Management", has: false },
    { label: "Marketing", has: false },
    { label: "Theme", has: false },
    { label: "Products + Categories", has: true },
    { label: "Blogs", has: true },
  ],
};

function PermissionPills({ role }: { role: string }) {
  const pills = ROLE_PILLS[role];
  if (!pills) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {pills.map((p) => (
        <span
          key={p.label}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
            p.has
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-muted text-muted-foreground border-border line-through opacity-60"
          }`}
        >
          {p.has ? "✓" : "✗"} {p.label}
        </span>
      ))}
    </div>
  );
}

// ─── FieldError ───────────────────────────────────────────────────────────────

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-0.5">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}
