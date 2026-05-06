import { useState, useEffect } from "react";
import {
  useGetAllThemesQuery,
  useGetTemplatesQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useActivateThemeMutation,
} from "@/store/api/themeApi";
import type { ThemeSettings } from "@/store/api/themeApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Plus, Palette, Monitor } from "lucide-react";
import { toast } from "sonner";
import ThemePreview from "@/components/admin/ThemePreview";

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "Montserrat", "Open Sans"];
const BORDER_RADIUS_OPTIONS = ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "9999px"];

const ThemeCustomizer = () => {
  const { data: themesRes, isLoading } = useGetAllThemesQuery();
  const { data: templatesRes } = useGetTemplatesQuery();
  const [createTheme] = useCreateThemeMutation();
  const [updateTheme] = useUpdateThemeMutation();
  const [activateTheme] = useActivateThemeMutation();

  const themes = themesRes?.data || [];
  const templates = templatesRes?.data || [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ThemeSettings>>({});

  const selected = themes.find((t) => t.id === selectedId);

  useEffect(() => {
    if (selected) setForm({ ...selected });
  }, [selectedId, selected]);

  useEffect(() => {
    const active = themes.find((t) => t.isActive);
    if (active && !selectedId) setSelectedId(active.id);
  }, [themes]);

  const handleSave = async () => {
    if (!selectedId) return;
    try {
      await updateTheme({ id: selectedId, ...form }).unwrap();
      toast.success("Theme saved");
    } catch {
      toast.error("Failed to save theme");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateTheme(id).unwrap();
      toast.success("Theme activated — storefront will update within minutes");
    } catch {
      toast.error("Failed to activate theme");
    }
  };

  const handleCreate = async () => {
    if (!templates[0]) return;
    try {
      const t = await createTheme({ templateId: templates[0].id, storeName: "New Theme", isActive: false }).unwrap();
      setSelectedId(t.data.id);
      toast.success("New theme created");
    } catch {
      toast.error("Failed to create theme");
    }
  };

  const set = (key: keyof ThemeSettings, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Theme Customizer</h1>
        <Button onClick={handleCreate} size="sm" variant="outline">
          <Plus size={16} className="mr-2" /> New Theme
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-9 gap-6">
        {/* Theme List */}
        <div className="space-y-3 xl:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Your Themes</p>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            themes.map((theme) => (
              <Card key={theme.id}
                className={`cursor-pointer transition-all ${selectedId === theme.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedId(theme.id)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{theme.storeName}</p>
                    <p className="text-xs text-muted-foreground">{theme.template?.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.isActive && <CheckCircle size={14} className="text-green-500" />}
                    <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.primaryColor }} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 xl:col-span-4">
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Palette size={20} /> Edit Theme
                    </CardTitle>
                    <CardDescription>Changes apply to the storefront after activation</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!selected.isActive && (
                      <Button variant="outline" size="sm" onClick={() => handleActivate(selected.id)}>
                        Activate
                      </Button>
                    )}
                    {selected.isActive && <Badge className="bg-green-500 text-white">Live</Badge>}
                    <Button size="sm" onClick={handleSave}>Save</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="branding">
                  <TabsList className="mb-6">
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="typography">Typography</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                  </TabsList>

                  <TabsContent value="branding" className="space-y-4">
                    <div>
                      <Label>Store Name</Label>
                      <Input value={form.storeName || ""} onChange={(e) => set("storeName", e.target.value)} />
                    </div>
                    <div>
                      <Label>Logo URL</Label>
                      <Input value={form.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://..." />
                    </div>
                    <div>
                      <Label>Template</Label>
                      <Select value={form.templateId || ""} onValueChange={(v) => set("templateId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-4">
                    {[
                      { key: "primaryColor" as const, label: "Primary Color" },
                      { key: "secondaryColor" as const, label: "Secondary Color" },
                      { key: "accentColor" as const, label: "Accent Color" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-4">
                        <Label className="w-40">{label}</Label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={(form[key] as string) || "#000000"}
                            onChange={(e) => set(key, e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer border" />
                          <Input value={(form[key] as string) || ""} onChange={(e) => set(key, e.target.value)}
                            className="w-32 font-mono text-sm" placeholder="#000000" />
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="typography" className="space-y-4">
                    <div>
                      <Label>Font Family</Label>
                      <Select value={form.fontFamily || "Inter"} onValueChange={(v) => set("fontFamily", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    <div>
                      <Label>Border Radius</Label>
                      <Select value={form.borderRadius || "0.5rem"} onValueChange={(v) => set("borderRadius", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BORDER_RADIUS_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>{r === "0" ? "Sharp" : r === "9999px" ? "Pill" : r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Button Style</Label>
                      <Select value={form.buttonStyle || "solid"} onValueChange={(v) => set("buttonStyle", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                          <SelectItem value="ghost">Ghost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Layout Type</Label>
                      <Select value={form.layoutType || "default"} onValueChange={(v) => set("layoutType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="wide">Wide</SelectItem>
                          <SelectItem value="centered">Centered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Select a theme on the left to start customizing
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Preview */}
        <div className="xl:col-span-3 space-y-3">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Monitor size={14} /> Live Preview
          </p>
          <div className="sticky top-4">
            <ThemePreview form={form} />
            <p className="text-xs text-muted-foreground text-center mt-2">Updates as you edit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
