import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { Plus, Pencil, Trash2, UserCog, ShieldCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { AdminForm } from "@/components/admin/AdminForm";

import {
  useGetAdminsQuery,
  useToggleAdminActiveMutation,
  useDeleteAdminMutation,
  type AdminUser,
} from "@/store/api/adminApi";
import { useAppSelector } from "@/store/store";
import { useToast } from "@/hooks/use-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-red-50 text-red-700 border-red-200",
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  EDITOR: "bg-purple-50 text-purple-700 border-purple-200",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Store Manager",
  EDITOR: "Editor",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Admins = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [formOpen, setFormOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const queryParams = {
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "10", 10),
    search: searchParams.get("search") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    isActive: searchParams.get("isActive") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  };

  const { data, isFetching } = useGetAdminsQuery(queryParams);
  const admins = data?.data ?? [];
  const pagination = data?.pagination;

  const [toggleActive, { isLoading: toggling }] = useToggleAdminActiveMutation();
  const [deleteAdmin, { isLoading: deleting }] = useDeleteAdminMutation();

  const handleToggle = async (admin: AdminUser) => {
    try {
      await toggleActive(admin.id).unwrap();
      toast({
        title: admin.isActive ? "Admin deactivated" : "Admin activated",
        description: `"${admin.name}" is now ${admin.isActive ? "inactive" : "active"}.`,
      });
    } catch {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdmin(deleteTarget.id).unwrap();
      toast({ title: "Admin removed", description: `"${deleteTarget.name}" has been deactivated.` });
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Failed to remove admin.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditAdmin(null);
    setFormOpen(true);
  };

  const openEdit = (admin: AdminUser) => {
    setEditAdmin(admin);
    setFormOpen(true);
  };

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "Admin",
      sortable: true,
      filter: { type: "text", paramKey: "search", placeholder: "Search name or email…" },
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary uppercase">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {row.name}
              {row.id === currentUser?.id && (
                <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(you)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      filter: {
        type: "select",
        paramKey: "role",
        placeholder: "All roles",
        options: [
          { label: "Super Admin", value: "SUPER_ADMIN" },
          { label: "Store Manager", value: "ADMIN" },
          { label: "Editor", value: "EDITOR" },
        ],
      },
      cell: (row) => (
        <Badge
          className={`text-xs border ${ROLE_BADGE[row.role] ?? "bg-muted text-muted-foreground"}`}
        >
          {ROLE_LABEL[row.role] ?? row.role}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row) =>
        row.phone ? (
          <span className="text-sm text-muted-foreground">{row.phone}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "isActive",
      header: "Status",
      filter: { type: "boolean", paramKey: "isActive", placeholder: "All" },
      cell: (row) =>
        row.isActive ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-xs">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-muted-foreground text-xs">
            Inactive
          </Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      cell: (row) => {
        const parsed = row.createdAt ? parseISO(row.createdAt) : null;
        return parsed && isValid(parsed) ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(parsed, "MMM d, yyyy")}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "110px",
      headerClassName: "text-right pr-4",
      className: "text-right",
      cell: (row) => {
        const isSelf = row.id === currentUser?.id;
        const isSuperAdmin = row.role === "SUPER_ADMIN";
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(row)}
                >
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
                  className="h-7 w-7"
                  onClick={() => handleToggle(row)}
                  disabled={isSelf || toggling}
                >
                  {row.isActive ? (
                    <UserX className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSelf ? "Cannot deactivate yourself" : row.isActive ? "Deactivate" : "Activate"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(row)}
                  disabled={isSelf || isSuperAdmin}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSelf
                  ? "Cannot remove yourself"
                  : isSuperAdmin
                    ? "Super Admin cannot be removed"
                    : "Remove"}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination
              ? `${pagination.total} staff member${pagination.total !== 1 ? "s" : ""}`
              : "Manage staff accounts and their access levels"}
          </p>
        </div>
      </div>

      <DataTable<AdminUser>
        columns={columns}
        data={admins}
        pagination={pagination}
        loading={isFetching}
        rowKey={(row) => row.id}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-6">
            <UserCog className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No admins found</p>
            <p className="text-xs text-muted-foreground">
              Add staff members to manage your store
            </p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-1 gap-1.5">
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>
        }
      />

      <AdminForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditAdmin(null);
        }}
        admin={editAdmin}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate <strong>"{deleteTarget?.name}"</strong> and revoke their login
              access immediately. Their account data will be kept for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Removing…" : "Remove Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admins;
