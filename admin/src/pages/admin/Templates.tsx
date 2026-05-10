import { useGetTemplatesQuery, useGetAllThemesQuery, useActivateThemeMutation } from "@/store/api/themeApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Layout } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_PREVIEWS: Record<string, { description: string; color: string }> = {
  fashion: { description: "Elegant, editorial-style layout for fashion & lifestyle brands", color: "#1a1a2e" },
  electronics: { description: "Tech-focused dark theme with bold product highlights", color: "#0f172a" },
  minimal: { description: "Clean, whitespace-rich design for curated collections", color: "#fafafa" },
  modern: { description: "Split-layout energetic design for modern direct-to-consumer brands", color: "#6366f1" },
};

const Templates = () => {
  const { data: templatesRes, isLoading } = useGetTemplatesQuery();
  const { data: themesRes } = useGetAllThemesQuery();
  const [activateTheme] = useActivateThemeMutation();

  const templates = templatesRes?.data || [];
  const themes = themesRes?.data || [];
  const activeTheme = themes.find((t) => t.isActive);

  const handleApplyTemplate = async (templateId: string) => {
    const matchingTheme = themes.find((t) => t.templateId === templateId);
    if (matchingTheme) {
      try {
        await activateTheme(matchingTheme.id).unwrap();
        toast.success("Template applied — storefront will update shortly");
      } catch {
        toast.error("Failed to apply template");
      }
    } else {
      toast.info("Create a theme with this template in Theme Customizer first");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground mt-1">Choose a storefront template for your shop</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {templates.map((template) => {
            const preview = TEMPLATE_PREVIEWS[template.slug] || { description: template.description || "", color: "#000" };
            const isActive = activeTheme?.templateId === template.id;

            return (
              <Card key={template.id} className={isActive ? "ring-2 ring-primary" : ""}>
                <div className="h-40 rounded-t-lg flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: preview.color }}>
                  <Layout size={48} className="text-white/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-lg font-bold">{template.name}</span>
                    <span className="text-xs opacity-70 mt-1">Preview</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {isActive && <Badge className="bg-green-500 text-white">Active</Badge>}
                  </div>
                  <CardDescription>{preview.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={isActive ? "secondary" : "default"}
                    disabled={isActive}
                    onClick={() => handleApplyTemplate(template.id)}
                  >
                    {isActive ? "Currently Active" : "Apply Template"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Templates;
