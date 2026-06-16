import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { Pencil, Trash2, Info, Users as UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { UserDetailSheet } from "@/components/users/UserDetailSheet";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type User,
} from "@/store/api/userApi";
import { useAppSelector } from "@/store/store";
import { useToast } from "@/hooks/use-toast";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
  ADMIN:       { label: "Admin",       variant: "default" },
  EDITOR:      { label: "Editor",      variant: "secondary" },
  CUSTOMER:    { label: "Customer",    variant: "outline" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Users = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const currentUser = useAppSelector((s) => s.auth.user);
  const isSuperAdmin =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "super_admin";

  const [viewUser, setViewUser]       = useState<User | null>(null);
  const [editUser, setEditUser]       = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editForm, setEditForm]       = useState({ role: "", isActive: true });

  const queryParams = {
    page:     parseInt(searchParams.get("page")  ?? "1",  10),
    limit:    parseInt(searchParams.get("limit") ?? "10", 10),
    search:   searchParams.get("search")   ?? undefined,
    role:     searchParams.get("role")     ?? undefined,
    isActive: searchParams.get("isActive") ?? undefined,
  };

  const { data, isFetching } = useGetUsersQuery(queryParams);
  const users      = data?.data       ?? [];
  const pagination = data?.pagination;

  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      await updateUser({ id: editUser.id, ...editForm }).unwrap();
      toast({ title: "User updated" });
      setEditUser(null);
    } catch {
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id).unwrap();
      toast({ title: "User deleted", description: `${deleteTarget.name} has been removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      filter: { type: "text", paramKey: "search", placeholder: "Search by name or email…" },
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback className="text-xs font-semibold bg-muted">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[180px]" title={row.name}>
              {row.name}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      filter: {
        type: "select",
        paramKey: "role",
        placeholder: "All roles",
        options: [
          { label: "Super Admin", value: "SUPER_ADMIN" },
          { label: "Admin",       value: "ADMIN" },
          { label: "Editor",      value: "EDITOR" },
          { label: "Customer",    value: "CUSTOMER" },
        ],
      },
      cell: (row) => {
        const cfg = ROLE_CONFIG[row.role] ?? { label: row.role, variant: "outline" as const };
        return <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>;
      },
    },
    {
      key: "isActive",
      header: "Status",
      filter: { type: "boolean", paramKey: "isActive", placeholder: "All" },
      cell: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-emerald-600 font-medium">Active</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
            <span className="text-xs text-muted-foreground">Inactive</span>
          </span>
        ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      cell: (row) => {
        const d = row.createdAt ? parseISO(row.createdAt) : null;
        return d && isValid(d) ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(d, "MMM d, yyyy")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "120px",
      headerClassName: "text-right pr-4",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* View details — always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewUser(row)}
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>

          {/* Edit & Delete — super admin only, not self */}
          {isSuperAdmin && row.id !== currentUser?.id && (
            <>
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
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total !== undefined
              ? `${pagination.total} user${pagination.total !== 1 ? "s" : ""} total`
              : "Manage customer accounts and admin roles"}
          </p>
        </div>
      </div>

      <DataTable<User>
        columns={columns}
        data={users}
        pagination={pagination}
        loading={isFetching}
        rowKey={(row) => row.id}
        emptyState={
          <div className="flex flex-col items-center gap-3 py-6">
            <UsersIcon className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No users found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        }
      />

      {/* View Details Sheet */}
      <Sheet open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewUser && (
            <UserDetailSheet
              user={viewUser}
              currentUserId={currentUser?.id}
              isSuperAdmin={isSuperAdmin}
              onEdit={() => {
                setViewUser(null);
                openEdit(viewUser);
              }}
              onDelete={() => {
                setViewUser(null);
                setDeleteTarget(viewUser);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update role and account status for{" "}
              <strong>{editUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow this user to sign in
                </p>
              </div>
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(v) => setEditForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>"{deleteTarget?.name}"</strong>. This action cannot be
              undone.
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

export default Users;
