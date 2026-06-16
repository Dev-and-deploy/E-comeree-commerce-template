import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { Plus, Pencil, Trash2, FileText, Info } from "lucide-react";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { BlogForm } from "@/components/blogs/BlogForm";

import {
  useGetAdminBlogsQuery,
  useDeleteBlogMutation,
  type Blog,
} from "@/store/api/blogApi";
import { useToast } from "@/hooks/use-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusVariant: Record<Blog["status"], "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  SCHEDULED: "outline",
};

function seoScore(blog: Blog) {
  const fields = [blog.metaTitle, blog.metaDescription, blog.focusKeyword, blog.ogTitle];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = parseISO(iso);
    return isValid(d) ? format(d, "MMM d, yyyy") : iso;
  } catch {
    return iso;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Blogs = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [formOpen, setFormOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);

  const queryParams = {
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "10", 10),
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    date_from: searchParams.get("date_from") ?? undefined,
    date_to: searchParams.get("date_to") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: (searchParams.get("sortOrder") ?? "desc") as string,
  };

  const { data, isFetching } = useGetAdminBlogsQuery(queryParams);
  const blogs = data?.data ?? [];
  const pagination = data?.pagination;

  const [deleteBlog, { isLoading: deleting }] = useDeleteBlogMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlog(deleteTarget.id).unwrap();
      toast({ title: "Post deleted", description: `"${deleteTarget.title}" removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditBlog(null);
    setFormOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditBlog(b);
    setFormOpen(true);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns: DataTableColumn<Blog>[] = [
    {
      key: "featuredImage",
      header: "",
      width: "56px",
      cell: (row) => (
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center border">
          {row.featuredImage ? (
            <img
              src={row.featuredImage}
              alt={row.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Post",
      sortable: true,
      filter: { type: "text", paramKey: "search", placeholder: "Search posts…" },
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate max-w-[220px]" title={row.title}>
            {row.title}
          </p>
          <p className="text-xs text-muted-foreground font-mono">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      cell: (row) => <span className="text-sm">{row.author || "—"}</span>,
    },
    {
      key: "category",
      header: "Category",
      cell: (row) =>
        row.category ? (
          <Badge variant="outline" className="text-xs font-normal">
            {row.category}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      filter: {
        type: "select",
        paramKey: "status",
        placeholder: "All statuses",
        options: [
          { label: "Published", value: "PUBLISHED" },
          { label: "Draft", value: "DRAFT" },
          { label: "Scheduled", value: "SCHEDULED" },
        ],
      },
      cell: (row) => (
        <Badge variant={statusVariant[row.status] ?? "secondary"} className="capitalize text-xs">
          {row.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "seo",
      header: "SEO Score",
      cell: (row) => {
        const score = seoScore(row);
        return (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-red-500"
              }`}
            />
            <span className="text-sm tabular-nums">{score}%</span>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      filter: { type: "date-range", paramKey: "date" },
      cell: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(row.publishedAt || row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "110px",
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
                onClick={() => setViewBlog(row)}
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>
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
          <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total !== undefined
              ? `${pagination.total} post${pagination.total !== 1 ? "s" : ""} total`
              : "Create and manage blog posts with SEO optimization"}
          </p>
        </div>
      </div>

      <DataTable<Blog>
        columns={columns}
        data={blogs}
        pagination={pagination}
        loading={isFetching}
        rowKey={(row) => row.id}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-6">
            <FileText className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No posts yet</p>
            <p className="text-xs text-muted-foreground">
              Create your first blog post to get started
            </p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-1 gap-1.5">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        }
      />

      {/* Create / Edit form */}
      <BlogForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditBlog(null);
        }}
        blog={editBlog}
      />

      {/* Detail sheet */}
      <Sheet open={!!viewBlog} onOpenChange={(open) => !open && setViewBlog(null)}>
        <SheetContent className="w-[440px] sm:w-[520px] p-0">
          {viewBlog && <BlogDetailSheet blog={viewBlog} />}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>"{deleteTarget?.title}"</strong>. This action cannot be
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

export default Blogs;

// ─── Blog Detail Sheet ────────────────────────────────────────────────────────

function BlogDetailSheet({ blog }: { blog: Blog }) {
  const score = seoScore(blog);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
        {blog.featuredImage && (
          <div className="h-32 rounded-lg overflow-hidden border bg-muted mb-3">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <SheetTitle className="text-lg leading-tight">{blog.title}</SheetTitle>
        <p className="text-xs font-mono text-muted-foreground mt-0.5">/{blog.slug}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant={statusVariant[blog.status]} className="capitalize">
            {blog.status.toLowerCase()}
          </Badge>
          {blog.category && (
            <Badge variant="outline" className="text-xs">
              {blog.category}
            </Badge>
          )}
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Author</p>
              <p className="text-sm font-medium mt-0.5">{blog.author || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SEO Score</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className={`h-2 w-2 rounded-full ${
                    score >= 75
                      ? "bg-emerald-500"
                      : score >= 50
                      ? "bg-amber-400"
                      : "bg-red-500"
                  }`}
                />
                <p className="text-sm font-medium">{score}%</p>
              </div>
            </div>
          </div>

          {blog.excerpt && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Excerpt
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </>
          )}

          {blog.tags?.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              SEO
            </p>
            {blog.metaTitle && (
              <div>
                <p className="text-xs text-muted-foreground">Meta Title</p>
                <p className="text-sm font-medium mt-0.5">{blog.metaTitle}</p>
              </div>
            )}
            {blog.metaDescription && (
              <div>
                <p className="text-xs text-muted-foreground">Meta Description</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {blog.metaDescription}
                </p>
              </div>
            )}
            {blog.focusKeyword && (
              <div>
                <p className="text-xs text-muted-foreground">Focus Keyword</p>
                <p className="text-sm font-medium mt-0.5">{blog.focusKeyword}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p>Created</p>
              <p className="font-medium text-foreground mt-0.5">
                {formatDate(blog.createdAt)}
              </p>
            </div>
            <div>
              <p>Published</p>
              <p className="font-medium text-foreground mt-0.5">
                {formatDate(blog.publishedAt) || "—"}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
