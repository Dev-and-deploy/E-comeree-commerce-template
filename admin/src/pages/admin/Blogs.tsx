import { useState } from "react";
import { useGetBlogsQuery, useCreateBlogMutation, useDeleteBlogMutation, useUpdateBlogMutation } from "@/store/api/mockApi";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Edit, Search, Globe } from "lucide-react";
import { BlogPost } from "@/store/api/mockData";

const statusColors: Record<string, string> = { published: "default", draft: "secondary", scheduled: "outline" };

const emptyBlog: Partial<BlogPost> = {
  title: "", slug: "", excerpt: "", content: "", status: "draft", author: "", category: "", tags: [],
  featuredImage: "",
  seo: { metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogImage: "", focusKeyword: "", noIndex: false, noFollow: false, structuredData: "" },
};

const Blogs = () => {
  const { data: blogs, isLoading } = useGetBlogsQuery();
  const [createBlog] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BlogPost>>(emptyBlog);

  const handleSave = () => {
    if (editing && form.id) {
      updateBlog(form as BlogPost);
    } else {
      createBlog(form);
    }
    setOpen(false);
    setForm(emptyBlog);
    setEditing(false);
  };

  const openEdit = (blog: BlogPost) => {
    setForm(blog);
    setEditing(true);
    setOpen(true);
  };

  const openCreate = () => {
    setForm(emptyBlog);
    setEditing(false);
    setOpen(true);
  };

  // const goo = "gooo"

  const updateSeo = (field: string, value: any) => {
    setForm({ ...form, seo: { ...form.seo!, [field]: value } });
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts with SEO optimization</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Post</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs?.map((b) => {
                const seoFields = [b.seo.metaTitle, b.seo.metaDescription, b.seo.focusKeyword, b.seo.ogTitle];
                const seoScore = Math.round((seoFields.filter(Boolean).length / seoFields.length) * 100);
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.title}</p>
                        <p className="text-xs text-muted-foreground">/{b.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{b.author}</TableCell>
                    <TableCell><Badge variant="outline">{b.category}</Badge></TableCell>
                    <TableCell><Badge variant={statusColors[b.status] as any}>{b.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${seoScore >= 75 ? "bg-green-500" : seoScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className="text-sm">{seoScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{b.publishedAt || b.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteBlog(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Blog Editor Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>Fill in the post details and SEO information</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="content" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="seo" className="flex-1"><Search className="h-3 w-3 mr-1" />SEO</TabsTrigger>
              <TabsTrigger value="og" className="flex-1"><Globe className="h-3 w-3 mr-1" />Open Graph</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) }); }} placeholder="Post title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Fashion, Lifestyle" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Short summary..." />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Write your blog post content..." />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags?.join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="e.g. fashion, summer, trends" />
              </div>
              <div className="space-y-2">
                <Label>Featured Image URL</Label>
                <Input value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} placeholder="https://..." />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="rounded-lg border border-border p-4 space-y-1 bg-muted/30">
                <p className="text-sm font-medium">SEO Preview</p>
                <p className="text-primary text-base font-medium truncate">{form.seo?.metaTitle || form.title || "Page Title"}</p>
                <p className="text-muted-foreground text-xs">{form.seo?.canonicalUrl || `https://store.com/blog/${form.slug || "post-slug"}`}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{form.seo?.metaDescription || form.excerpt || "Meta description will appear here..."}</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Title <span className="text-muted-foreground text-xs">({(form.seo?.metaTitle?.length || 0)}/60)</span></Label>
                <Input value={form.seo?.metaTitle} onChange={(e) => updateSeo("metaTitle", e.target.value)} maxLength={60} placeholder="SEO optimized title" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description <span className="text-muted-foreground text-xs">({(form.seo?.metaDescription?.length || 0)}/160)</span></Label>
                <Textarea value={form.seo?.metaDescription} onChange={(e) => updateSeo("metaDescription", e.target.value)} maxLength={160} rows={3} placeholder="Compelling meta description..." />
              </div>
              <div className="space-y-2">
                <Label>Focus Keyword</Label>
                <Input value={form.seo?.focusKeyword} onChange={(e) => updateSeo("focusKeyword", e.target.value)} placeholder="Primary keyword for this page" />
              </div>
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input value={form.seo?.canonicalUrl} onChange={(e) => updateSeo("canonicalUrl", e.target.value)} placeholder="https://store.com/blog/..." />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Structured Data (JSON-LD)</Label>
                <Textarea value={form.seo?.structuredData} onChange={(e) => updateSeo("structuredData", e.target.value)} rows={4} placeholder='{"@type": "BlogPosting", ...}' className="font-mono text-xs" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.seo?.noIndex} onCheckedChange={(v) => updateSeo("noIndex", v)} />
                  <Label className="text-sm">noIndex</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.seo?.noFollow} onCheckedChange={(v) => updateSeo("noFollow", v)} />
                  <Label className="text-sm">noFollow</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="og" className="space-y-4 mt-4">
              <div className="rounded-lg border border-border p-4 space-y-2 bg-muted/30">
                <p className="text-sm font-medium">Social Preview</p>
                <div className="rounded border border-border overflow-hidden">
                  {form.seo?.ogImage && <div className="h-32 bg-muted flex items-center justify-center text-xs text-muted-foreground">Image Preview</div>}
                  <div className="p-3">
                    <p className="font-medium text-sm">{form.seo?.ogTitle || form.title || "OG Title"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{form.seo?.ogDescription || form.excerpt || "OG description..."}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>OG Title</Label>
                <Input value={form.seo?.ogTitle} onChange={(e) => updateSeo("ogTitle", e.target.value)} placeholder="Title for social sharing" />
              </div>
              <div className="space-y-2">
                <Label>OG Description</Label>
                <Textarea value={form.seo?.ogDescription} onChange={(e) => updateSeo("ogDescription", e.target.value)} rows={3} placeholder="Description for social sharing" />
              </div>
              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input value={form.seo?.ogImage} onChange={(e) => updateSeo("ogImage", e.target.value)} placeholder="https://..." />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"} Post</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blogs;
