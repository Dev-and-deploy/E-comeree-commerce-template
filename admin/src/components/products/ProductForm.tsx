import { useEffect, useRef, useState } from "react";
import { useCurrencySymbol } from "@/lib/currency";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCategoriesQuery,
  type Product,
} from "@/store/api/productApi";
import { useUploadImageMutation } from "@/store/api/uploadApi";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, ImageIcon, Loader2, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional(),
  price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).positive("Must be positive"),
  comparePrice: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number({ invalid_type_error: "Enter a valid stock" }).int().min(0),
  sku: z.string().optional(),
  categoryId: z.string().uuid("Select a category"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: z.string().max(60, "Max 60 characters").optional(),
  seoDesc: z.string().max(160, "Max 160 characters").optional(),
  seoKeywords: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Slug generator ───────────────────────────────────────────────────────────

function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Prop types ───────────────────────────────────────────────────────────────

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const { toast } = useToast();
  const isEdit = !!product;

  const currencySymbol = useCurrencySymbol();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images & tags managed as local state (not react-hook-form arrays for simplicity)
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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
      price: 0,
      comparePrice: "",
      stock: 0,
      sku: "",
      categoryId: "",
      isActive: true,
      isFeatured: false,
      seoTitle: "",
      seoDesc: "",
      seoKeywords: "",
    },
  });

  const watchedName = watch("name");

  // Auto-generate slug from name (only when creating)
  useEffect(() => {
    if (!isEdit) {
      setValue("slug", toSlug(watchedName ?? ""), { shouldValidate: false });
    }
  }, [watchedName, isEdit, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (open && product) {
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        price: product.price,
        comparePrice: product.comparePrice ?? "",
        stock: product.stock,
        sku: product.sku ?? "",
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        seoTitle: product.seoTitle ?? "",
        seoDesc: product.seoDesc ?? "",
        seoKeywords: product.seoKeywords ?? "",
      });
      setImages(product.images ?? []);
      setTags(product.tags ?? []);
    } else if (open && !product) {
      reset();
      setImages([]);
      setTags([]);
    }
  }, [open, product, reset]);

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setImages((prev) => [...prev, url]);
      setImageInput("");
    } catch {
      toast({ title: "Invalid URL", description: "Enter a valid image URL", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file).unwrap();
      setImages((prev) => [...prev, result.data.url]);
      toast({ title: "Image uploaded", description: "Added to product images." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload image.", variant: "destructive" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      comparePrice: values.comparePrice === "" ? undefined : Number(values.comparePrice),
      images,
      tags,
    };

    try {
      if (isEdit && product) {
        await updateProduct({ id: product.id, ...payload }).unwrap();
        toast({ title: "Product updated", description: `"${values.name}" saved successfully.` });
      } else {
        await createProduct(payload).unwrap();
        toast({ title: "Product created", description: `"${values.name}" added successfully.` });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const isBusy = creating || updating;

  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");
  const seoTitle = watch("seoTitle") ?? "";
  const seoDesc = watch("seoDesc") ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <ScrollArea className="h-[calc(80vh-10rem)]">
            <div className="px-6 py-4">
              <Tabs defaultValue="basic">
                <TabsList className="mb-5 grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* ── Basic Info ── */}
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">
                        Product Name <span className="text-destructive">*</span>
                      </Label>
                      <Input id="name" {...register("name")} placeholder="e.g. Classic White Sneaker" />
                      {errors.name && <FieldError>{errors.name.message}</FieldError>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="slug">
                        Slug <span className="text-destructive">*</span>
                      </Label>
                      <Input id="slug" {...register("slug")} placeholder="classic-white-sneaker" />
                      {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the product…"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="price">
                        Price ({currencySymbol}) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("price")}
                        placeholder="0.00"
                      />
                      {errors.price && <FieldError>{errors.price.message}</FieldError>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="comparePrice">Compare Price ({currencySymbol})</Label>
                      <Input
                        id="comparePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("comparePrice")}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">Original price for sale display</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="stock">
                        Stock <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        {...register("stock")}
                        placeholder="0"
                      />
                      {errors.stock && <FieldError>{errors.stock.message}</FieldError>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" {...register("sku")} placeholder="SKU-001" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="categoryId">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("categoryId")}
                        onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
                      >
                        <SelectTrigger id="categoryId">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Media ── */}
                <TabsContent value="media" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Product Images</Label>

                    {/* URL input */}
                    <div className="flex gap-2">
                      <Input
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={addImage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* File upload */}
                    <div className="flex items-center gap-2">
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
                        className="gap-1.5"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploading ? "Uploading…" : "Upload File"}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Max 5 MB · JPEG, PNG, WebP, GIF
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      First image is used as the primary thumbnail.
                    </p>
                  </div>

                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((url, i) => (
                        <div
                          key={i}
                          className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
                        >
                          <img
                            src={url}
                            alt={`Image ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "";
                            }}
                          />
                          {i === 0 && (
                            <Badge className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5">
                              Primary
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1.5 right-1.5 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed text-muted-foreground gap-2">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                      <p className="text-sm">No images added yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* ── Settings ── */}
                <TabsContent value="settings" className="space-y-5 mt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium text-sm">Active</p>
                        <p className="text-xs text-muted-foreground">
                          Product is visible in the store
                        </p>
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(v) => setValue("isActive", v)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium text-sm">Featured</p>
                        <p className="text-xs text-muted-foreground">
                          Show on homepage featured section
                        </p>
                      </div>
                      <Switch
                        checked={isFeatured}
                        onCheckedChange={(v) => setValue("isFeatured", v)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="Add a tag (press Enter)"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 pr-1 text-xs cursor-pointer"
                            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                          >
                            {tag}
                            <X className="h-2.5 w-2.5" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── SEO ── */}
                <TabsContent value="seo" className="space-y-4 mt-0">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                    SEO fields are optional. If left blank, the product name and description are used.
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <span className={cn("text-xs", seoTitle.length > 60 ? "text-destructive" : "text-muted-foreground")}>
                        {seoTitle.length}/60
                      </span>
                    </div>
                    <Input
                      id="seoTitle"
                      {...register("seoTitle")}
                      placeholder="Page title for search engines"
                    />
                    {errors.seoTitle && <FieldError>{errors.seoTitle.message}</FieldError>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seoDesc">Meta Description</Label>
                      <span className={cn("text-xs", seoDesc.length > 160 ? "text-destructive" : "text-muted-foreground")}>
                        {seoDesc.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="seoDesc"
                      {...register("seoDesc")}
                      rows={3}
                      placeholder="Brief description for search results"
                    />
                    {errors.seoDesc && <FieldError>{errors.seoDesc.message}</FieldError>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="seoKeywords">Keywords</Label>
                    <Input
                      id="seoKeywords"
                      {...register("seoKeywords")}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated keywords
                    </p>
                  </div>

                  {/* Live preview */}
                  {(seoTitle || seoDesc) && (
                    <div className="rounded-lg border p-4 space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Search preview</p>
                      <p className="text-[#1a0dab] text-base font-medium truncate">
                        {seoTitle || watch("name") || "Product title"}
                      </p>
                      <p className="text-xs text-[#006621]">yourstore.com/products/{watch("slug")}</p>
                      <p className="text-sm text-[#545454] line-clamp-2">
                        {seoDesc || watch("description") || "Product description will appear here."}
                      </p>
                    </div>
                  )}
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
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-0.5">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}
