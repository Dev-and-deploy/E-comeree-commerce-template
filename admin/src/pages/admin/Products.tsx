import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Package } from "lucide-react";

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
import { ProductForm } from "@/components/products/ProductForm";

import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  type Product,
} from "@/store/api/productApi";
import { useToast } from "@/hooks/use-toast";

// ─── Page ─────────────────────────────────────────────────────────────────────

const Products = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data ?? [];

  // Build query params from URL
  const queryParams = {
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "10", 10),
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    isActive: searchParams.get("isActive") ?? undefined,
    isFeatured: searchParams.get("isFeatured") ?? undefined,
    date_from: searchParams.get("date_from") ?? undefined,
    date_to: searchParams.get("date_to") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: (searchParams.get("sortOrder") ?? "desc") as string,
  };

  const { data, isFetching } = useGetAdminProductsQuery(queryParams);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id).unwrap();
      toast({ title: "Product deleted", description: `"${deleteTarget.name}" removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditProduct(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setFormOpen(true);
  };

  // ── Column definitions ──────────────────────────────────────────────────────

  const columns: DataTableColumn<Product>[] = [
    {
      key: "image",
      header: "",
      width: "56px",
      cell: (row) => (
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center border">
          {row.images?.[0] ? (
            <img
              src={row.images[0]}
              alt={row.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Package className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Product",
      sortable: true,
      filter: { type: "text", paramKey: "search", placeholder: "Search products…" },
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate max-w-[200px]" title={row.name}>
            {row.name}
          </p>
          {row.sku && (
            <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      filter: {
        type: "select",
        paramKey: "category",
        placeholder: "All categories",
        options: categories.map((c) => ({ label: c.name, value: c.id })),
      },
      cell: (row) =>
        row.category ? (
          <Badge variant="outline" className="text-xs font-normal">
            {row.category.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      cell: (row) => (
        <div className="text-sm">
          <span className="font-semibold">${row.price.toFixed(2)}</span>
          {row.comparePrice && (
            <span className="ml-1.5 text-xs text-muted-foreground line-through">
              ${row.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      cell: (row) => (
        <Badge
          variant={row.stock === 0 ? "destructive" : row.stock < 10 ? "outline" : "secondary"}
          className="font-mono text-xs"
        >
          {row.stock === 0 ? "Out of stock" : row.stock < 10 ? `Low (${row.stock})` : row.stock}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      filter: {
        type: "boolean",
        paramKey: "isActive",
        placeholder: "All",
      },
      cell: (row) =>
        row.isActive ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 gap-1 text-xs">
            <Eye className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="text-muted-foreground gap-1 text-xs"
          >
            <EyeOff className="h-3 w-3" />
            Inactive
          </Badge>
        ),
    },
    {
      key: "isFeatured",
      header: "Featured",
      filter: {
        type: "boolean",
        paramKey: "isFeatured",
      },
      cell: (row) =>
        row.isFeatured ? (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1 text-xs">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      filter: { type: "date-range", paramKey: "date" },
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total !== undefined
              ? `${pagination.total} product${pagination.total !== 1 ? "s" : ""} total`
              : "Manage your product catalogue"}
          </p>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<Product>
        columns={columns}
        data={products}
        pagination={pagination}
        loading={isFetching}
        rowKey={(row) => row.id}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-6">
            <Package className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-xs text-muted-foreground">
              Add your first product to start selling
            </p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-1 gap-1.5">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      {/* Create / Edit form */}
      <ProductForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProduct(null);
        }}
        product={editProduct}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
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

export default Products;
