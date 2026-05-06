import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Plus, Pencil, Trash2, FolderOpen, ImageIcon } from "lucide-react";

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
import { CategoryForm } from "@/components/products/CategoryForm";

import {
  useGetAdminCategoriesQuery,
  useDeleteCategoryMutation,
  type Category,
} from "@/store/api/productApi";
import { useToast } from "@/hooks/use-toast";

// ─── Page ─────────────────────────────────────────────────────────────────────

const Categories = () => {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data, isFetching } = useGetAdminCategoriesQuery();
  const categories = data?.data ?? [];

  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id).unwrap();
      toast({ title: "Category deleted", description: `"${deleteTarget.name}" removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditCategory(null);
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditCategory(c);
    setFormOpen(true);
  };

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns: DataTableColumn<Category>[] = [
    {
      key: "image",
      header: "",
      width: "56px",
      cell: (row) => (
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center border">
          {row.image ? (
            <img
              src={row.image}
              alt={row.name}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Category",
      sortable: true,
      filter: { type: "text", paramKey: "search", placeholder: "Search categories…" },
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate max-w-[200px]">{row.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (row) =>
        row.description ? (
          <p className="text-sm text-muted-foreground truncate max-w-[220px]" title={row.description}>
            {row.description}
          </p>
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
      key: "sortOrder",
      header: "Order",
      sortable: true,
      cell: (row) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.sortOrder ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => {
        const d = (row as Category & { createdAt?: string }).createdAt;
        const parsed = d ? parseISO(d) : null;
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
      width: "90px",
      headerClassName: "text-right pr-4",
      className: "text-right",
      cell: (row) => (
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {categories.length > 0
              ? `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`
              : "Organise your products into categories"}
          </p>
        </div>
      </div>

      <DataTable<Category>
        columns={columns}
        data={categories}
        loading={isFetching}
        rowKey={(row) => row.id}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-6">
            <FolderOpen className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No categories yet</p>
            <p className="text-xs text-muted-foreground">
              Create categories to organise your products
            </p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-1 gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        }
      />

      <CategoryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditCategory(null);
        }}
        category={editCategory}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>"{deleteTarget?.name}"</strong>. Products in this category will
              become uncategorised. This action cannot be undone.
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

export default Categories;
