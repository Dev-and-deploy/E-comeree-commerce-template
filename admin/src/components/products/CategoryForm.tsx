import { useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  type Category,
} from "@/store/api/productApi";
import { useUploadImageMutation } from "@/store/api/uploadApi";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
  seoTitle: z.string().max(60, "Max 60 characters").optional(),
  seoDesc: z.string().max(160, "Max 160 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const { toast } = useToast();
  const isEdit = !!category;

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      isActive: true,
      sortOrder: 0,
      seoTitle: "",
      seoDesc: "",
    },
  });

  const watchedName = watch("name");
  const isActive = watch("isActive");
  const imageUrl = watch("image") ?? "";
  const seoTitle = watch("seoTitle") ?? "";
  const seoDesc = watch("seoDesc") ?? "";

  useEffect(() => {
    if (!isEdit) {
      setValue("slug", toSlug(watchedName ?? ""), { shouldValidate: false });
    }
  }, [watchedName, isEdit, setValue]);

  useEffect(() => {
    if (open && category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        image: category.image ?? "",
        isActive: category.isActive,
        sortOrder: category.sortOrder ?? 0,
        seoTitle: category.seoTitle ?? "",
        seoDesc: category.seoDesc ?? "",
      });
    } else if (open && !category) {
      reset();
    }
  }, [open, category, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file).unwrap();
      setValue("image", result.data.url, { shouldValidate: true });
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      image: values.image || undefined,
    };
    try {
      if (isEdit && category) {
        await updateCategory({ id: category.id, ...payload }).unwrap();
        toast({ title: "Category updated", description: `"${values.name}" saved.` });
      } else {
        await createCategory(payload).unwrap();
        toast({ title: "Category created", description: `"${values.name}" added.` });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const isBusy = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <ScrollArea className="h-[calc(80vh-10rem)]">
            <div className="px-6 py-4">
              <Tabs defaultValue="basic">
                <TabsList className="mb-5 grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* ── Basic Info ── */}
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cat-name">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input id="cat-name" {...register("name")} placeholder="e.g. Sneakers" />
                      {errors.name && <FieldError>{errors.name.message}</FieldError>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cat-slug">
                        Slug <span className="text-destructive">*</span>
                      </Label>
                      <Input id="cat-slug" {...register("slug")} placeholder="sneakers" />
                      {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cat-desc">Description</Label>
                    <Textarea
                      id="cat-desc"
                      {...register("description")}
                      rows={3}
                      placeholder="Brief category description…"
                    />
                  </div>

                  <Separator />

                  {/* Image */}
                  <div className="space-y-2">
                    <Label>Category Image</Label>
                    <div className="flex gap-2">
                      <Input
                        {...register("image")}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-1.5 shrink-0"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploading ? "Uploading…" : "Upload"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Paste a URL or upload a file (max 5MB)</p>

                    {imageUrl ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border bg-muted group">
                        <img
                          src={imageUrl}
                          alt="Category"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <button
                          type="button"
                          onClick={() => setValue("image", "")}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground">
                        <ImageIcon className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium text-sm">Active</p>
                        <p className="text-xs text-muted-foreground">Visible in the store</p>
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(v) => setValue("isActive", v)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        min="0"
                        {...register("sortOrder")}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">Lower = shown first</p>
                    </div>
                  </div>
                </TabsContent>

                {/* ── SEO ── */}
                <TabsContent value="seo" className="space-y-4 mt-0">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Optional SEO fields. If left blank, the category name and description are used.
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cat-seoTitle">SEO Title</Label>
                      <span className={cn("text-xs", seoTitle.length > 60 ? "text-destructive" : "text-muted-foreground")}>
                        {seoTitle.length}/60
                      </span>
                    </div>
                    <Input
                      id="cat-seoTitle"
                      {...register("seoTitle")}
                      placeholder="Title for search engines"
                    />
                    {errors.seoTitle && <FieldError>{errors.seoTitle.message}</FieldError>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cat-seoDesc">Meta Description</Label>
                      <span className={cn("text-xs", seoDesc.length > 160 ? "text-destructive" : "text-muted-foreground")}>
                        {seoDesc.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="cat-seoDesc"
                      {...register("seoDesc")}
                      rows={3}
                      placeholder="Brief description for search results"
                    />
                    {errors.seoDesc && <FieldError>{errors.seoDesc.message}</FieldError>}
                  </div>
                </TabsContent>
              </Tabs>
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
            <Button type="submit" disabled={isBusy} className="min-w-[120px]">
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-0.5">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}
