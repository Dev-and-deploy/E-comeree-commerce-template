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
  useCreateBlogMutation,
  useUpdateBlogMutation,
  type Blog,
} from "@/store/api/blogApi";
import { useUploadImageMutation } from "@/store/api/uploadApi";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  X,
  ImageIcon,
  Loader2,
  AlertCircle,
  Upload,
  Globe,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  author: z.string().min(1, "Author is required"),
  category: z.string().optional(),
  metaTitle: z.string().max(60, "Max 60 characters").optional(),
  metaDescription: z.string().max(160, "Max 160 characters").optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().optional(),
  structuredData: z.string().optional(),
  noIndex: z.boolean(),
  noFollow: z.boolean(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: Blog | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlogForm({ open, onOpenChange, blog }: BlogFormProps) {
  const { toast } = useToast();
  const isEdit = !!blog;

  const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const [featuredImage, setFeaturedImage] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
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
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft",
      author: "",
      category: "",
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonicalUrl: "",
      structuredData: "",
      noIndex: false,
      noFollow: false,
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
    },
  });

  const watchedTitle = watch("title");

  useEffect(() => {
    if (!isEdit) {
      setValue("slug", toSlug(watchedTitle ?? ""), { shouldValidate: false });
    }
  }, [watchedTitle, isEdit, setValue]);

  useEffect(() => {
    if (open && blog) {
      reset({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt ?? "",
        content: blog.content ?? "",
        // Server stores UPPERCASE; form expects lowercase
        status: (blog.status.toLowerCase() as FormValues["status"]),
        author: blog.author,
        category: blog.category ?? "",
        metaTitle: blog.metaTitle ?? "",
        metaDescription: blog.metaDescription ?? "",
        focusKeyword: blog.focusKeyword ?? "",
        canonicalUrl: blog.canonicalUrl ?? "",
        structuredData: blog.structuredData ?? "",
        noIndex: blog.noIndex ?? false,
        noFollow: blog.noFollow ?? false,
        ogTitle: blog.ogTitle ?? "",
        ogDescription: blog.ogDescription ?? "",
        ogImage: blog.ogImage ?? "",
      });
      setFeaturedImage(blog.featuredImage ?? "");
      setTags(blog.tags ?? []);
    } else if (open && !blog) {
      reset();
      setFeaturedImage("");
      setTags([]);
      setTagInput("");
      setImageUrlInput("");
    }
  }, [open, blog, reset]);

  const applyUrlInput = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setFeaturedImage(url);
      setImageUrlInput("");
    } catch {
      toast({
        title: "Invalid URL",
        description: "Enter a valid image URL.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isOg = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file).unwrap();
      if (isOg) {
        setValue("ogImage", result.data.url);
      } else {
        setFeaturedImage(result.data.url);
      }
      toast({ title: "Image uploaded", description: "Image added successfully." });
    } catch {
      toast({
        title: "Upload failed",
        description: "Could not upload image.",
        variant: "destructive",
      });
    }
    if (e.target) e.target.value = "";
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
      tags,
      featuredImage: featuredImage || undefined,
    };

    try {
      if (isEdit && blog) {
        await updateBlog({ id: blog.id, ...payload }).unwrap();
        toast({ title: "Post updated", description: `"${values.title}" saved.` });
      } else {
        await createBlog(payload).unwrap();
        toast({ title: "Post created", description: `"${values.title}" created.` });
      }
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const isBusy = creating || updating;

  const metaTitle = watch("metaTitle") ?? "";
  const metaDescription = watch("metaDescription") ?? "";
  const ogImage = watch("ogImage") ?? "";
  const ogTitle = watch("ogTitle") ?? "";
  const ogDescription = watch("ogDescription") ?? "";
  const noIndex = watch("noIndex");
  const noFollow = watch("noFollow");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Post" : "New Blog Post"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <ScrollArea className="h-[calc(80vh-10rem)]">
            <div className="px-6 py-4">
              <Tabs defaultValue="content">
                <TabsList className="mb-5 grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="seo">
                    <Search className="h-3 w-3 mr-1" />
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="og">
                    <Globe className="h-3 w-3 mr-1" />
                    Open Graph
                  </TabsTrigger>
                </TabsList>

                {/* ── Content ── */}
                <TabsContent value="content" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input id="title" {...register("title")} placeholder="Post title" />
                      {errors.title && <FieldError>{errors.title.message}</FieldError>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="slug">
                        Slug <span className="text-destructive">*</span>
                      </Label>
                      <Input id="slug" {...register("slug")} placeholder="post-slug" />
                      {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={watch("status")}
                        onValueChange={(v) =>
                          setValue("status", v as FormValues["status"])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="author">
                        Author <span className="text-destructive">*</span>
                      </Label>
                      <Input id="author" {...register("author")} placeholder="Author name" />
                      {errors.author && <FieldError>{errors.author.message}</FieldError>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" {...register("category")} placeholder="e.g. Fashion" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      {...register("excerpt")}
                      rows={2}
                      placeholder="Short summary for previews..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      {...register("content")}
                      rows={8}
                      placeholder="Write your blog post content..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        placeholder="Add tag (press Enter)"
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
                            onClick={() =>
                              setTags((prev) => prev.filter((t) => t !== tag))
                            }
                          >
                            {tag}
                            <X className="h-2.5 w-2.5" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Media ── */}
                <TabsContent value="media" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Featured Image</Label>

                    <div className="flex gap-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), applyUrlInput())
                        }
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyUrlInput}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => handleFileUpload(e)}
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
                  </div>

                  {featuredImage ? (
                    <div className="relative group aspect-video rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage("")}
                        className="absolute top-2 right-2 bg-destructive text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-44 rounded-lg border-2 border-dashed text-muted-foreground gap-2">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                      <p className="text-sm">No image added yet</p>
                      <p className="text-xs">Enter a URL or upload a file above</p>
                    </div>
                  )}
                </TabsContent>

                {/* ── SEO ── */}
                <TabsContent value="seo" className="space-y-4 mt-0">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Search Preview
                    </p>
                    <p className="text-[#1a0dab] text-base font-medium truncate">
                      {metaTitle || watch("title") || "Page Title"}
                    </p>
                    <p className="text-xs text-[#006621]">
                      {watch("canonicalUrl") ||
                        `yourstore.com/blog/${watch("slug") || "post-slug"}`}
                    </p>
                    <p className="text-sm text-[#545454] line-clamp-2">
                      {metaDescription ||
                        watch("excerpt") ||
                        "Meta description will appear here..."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <span
                        className={cn(
                          "text-xs",
                          metaTitle.length > 60
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {metaTitle.length}/60
                      </span>
                    </div>
                    <Input
                      id="metaTitle"
                      {...register("metaTitle")}
                      placeholder="SEO optimized title"
                    />
                    {errors.metaTitle && (
                      <FieldError>{errors.metaTitle.message}</FieldError>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <span
                        className={cn(
                          "text-xs",
                          metaDescription.length > 160
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {metaDescription.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="metaDescription"
                      {...register("metaDescription")}
                      rows={3}
                      placeholder="Compelling meta description..."
                    />
                    {errors.metaDescription && (
                      <FieldError>{errors.metaDescription.message}</FieldError>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="focusKeyword">Focus Keyword</Label>
                      <Input
                        id="focusKeyword"
                        {...register("focusKeyword")}
                        placeholder="Primary keyword"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="canonicalUrl">Canonical URL</Label>
                      <Input
                        id="canonicalUrl"
                        {...register("canonicalUrl")}
                        placeholder="https://yourstore.com/blog/..."
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">
                    <Label htmlFor="structuredData">Structured Data (JSON-LD)</Label>
                    <Textarea
                      id="structuredData"
                      {...register("structuredData")}
                      rows={4}
                      placeholder='{"@type": "BlogPosting", ...}'
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 flex-1">
                      <div>
                        <p className="text-sm font-medium">noIndex</p>
                        <p className="text-xs text-muted-foreground">
                          Hide from search engines
                        </p>
                      </div>
                      <Switch
                        checked={noIndex}
                        onCheckedChange={(v) => setValue("noIndex", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 flex-1">
                      <div>
                        <p className="text-sm font-medium">noFollow</p>
                        <p className="text-xs text-muted-foreground">
                          Don't follow outbound links
                        </p>
                      </div>
                      <Switch
                        checked={noFollow}
                        onCheckedChange={(v) => setValue("noFollow", v)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ── Open Graph ── */}
                <TabsContent value="og" className="space-y-4 mt-0">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Social Preview
                    </p>
                    <div className="rounded border border-border overflow-hidden bg-background">
                      {(ogImage || featuredImage) && (
                        <div className="h-32 bg-muted overflow-hidden">
                          <img
                            src={ogImage || featuredImage}
                            alt="OG preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-medium text-sm">
                          {ogTitle || watch("title") || "OG Title"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ogDescription || watch("excerpt") || "OG description..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ogTitle">OG Title</Label>
                    <Input
                      id="ogTitle"
                      {...register("ogTitle")}
                      placeholder="Title for social sharing"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ogDescription">OG Description</Label>
                    <Textarea
                      id="ogDescription"
                      {...register("ogDescription")}
                      rows={3}
                      placeholder="Description for social sharing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>OG Image</Label>
                    <Input
                      {...register("ogImage")}
                      placeholder="https://example.com/og-image.jpg"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={ogFileInputRef}
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, true)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => ogFileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-1.5"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploading ? "Uploading…" : "Upload OG Image"}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Recommended: 1200×630px
                      </span>
                    </div>
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
            <Button type="submit" disabled={isBusy} className="min-w-[140px]">
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Post"
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
