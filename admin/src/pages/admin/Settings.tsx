import { useAppSelector, useAppDispatch } from "@/store/store";
import { setTheme } from "@/store/slices/themeSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Palette, Globe, Bell, DollarSign, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetSettingsQuery, useSaveSettingsMutation } from "@/store/api/settingsApi";
import { CURRENCIES } from "@/lib/currency";
import { toast } from "sonner";

const Settings = () => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((s) => s.theme);

  const { data: settingsData, isLoading } = useGetSettingsQuery();
  const [saveSettings, { isLoading: isSaving }] = useSaveSettingsMutation();

  const s = settingsData?.data;

  // Site settings
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Store & pricing
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("10");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("0");

  // Notifications & inventory
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true);

  useEffect(() => {
    if (!s) return;
    setSiteTitle(s.siteTitle || "");
    setSiteDescription(s.siteDescription || "");
    setContactEmail(s.contactEmail || "");
    setMaintenanceMode(s.maintenanceMode === "true");
    setCurrency(s.currency || "USD");
    setTaxRate(s.taxRate || "10");
    setFreeShippingThreshold(s.freeShippingThreshold || "0");
    setEmailNotifications(s.emailNotifications !== "false");
    setLowStockThreshold(s.lowStockThreshold || "5");
    setAllowGuestCheckout(s.allowGuestCheckout !== "false");
  }, [s]);

  const buildEntries = (pairs: Record<string, string>) =>
    Object.entries(pairs).map(([key, value]) => ({ key, value }));

  const saveSite = async () => {
    await saveSettings({
      settings: buildEntries({
        siteTitle,
        siteDescription,
        contactEmail,
        maintenanceMode: String(maintenanceMode),
      }),
    });
    toast.success("Site settings saved");
  };

  const savePricing = async () => {
    await saveSettings({
      settings: buildEntries({
        currency,
        taxRate,
        freeShippingThreshold,
      }),
    });
    toast.success("Pricing settings saved");
  };

  const saveOperations = async () => {
    await saveSettings({
      settings: buildEntries({
        emailNotifications: String(emailNotifications),
        lowStockThreshold,
        allowGuestCheckout: String(allowGuestCheckout),
      }),
    });
    toast.success("Operations settings saved");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="text-muted-foreground">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Store configuration panel</p>
        <Badge variant="outline" className="mt-2">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin Only
        </Badge>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <div>
              <CardTitle>Global Theme</CardTitle>
              <CardDescription>Customize the look and feel of the admin panel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch
              checked={mode === "dark"}
              onCheckedChange={(checked) => dispatch(setTheme(checked ? "dark" : "light"))}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => dispatch(setTheme("light"))}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${mode === "light" ? "border-primary" : "border-border"}`}
            >
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-foreground/80" />
                <div className="h-2 w-24 rounded bg-muted-foreground/30" />
                <div className="h-8 rounded bg-muted" />
                <div className="h-2 w-20 rounded bg-muted-foreground/20" />
              </div>
              <p className="mt-3 text-center text-sm font-medium">Light</p>
            </div>
            <div
              onClick={() => dispatch(setTheme("dark"))}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all bg-foreground/5 ${mode === "dark" ? "border-primary" : "border-border"}`}
            >
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-foreground/60" />
                <div className="h-2 w-24 rounded bg-foreground/20" />
                <div className="h-8 rounded bg-foreground/10" />
                <div className="h-2 w-20 rounded bg-foreground/15" />
              </div>
              <p className="mt-3 text-center text-sm font-medium">Dark</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <div>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>General website configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Title</Label>
            <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="MyStore" />
          </div>
          <div className="space-y-2">
            <Label>Site Description</Label>
            <Input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Premium e-commerce store" />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="support@mystore.com" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable the storefront for visitors</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          <Button onClick={saveSite} disabled={isSaving}>Save Site Settings</Button>
        </CardContent>
      </Card>

      {/* Currency & Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <div>
              <CardTitle>Currency &amp; Pricing</CardTitle>
              <CardDescription>Configure currency, tax rate, and shipping threshold</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Store Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} — {c.label} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Applied to all product prices and Stripe payments</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">Applied to every order total</p>
            </div>
            <div className="space-y-2">
              <Label>Free Shipping Threshold</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Orders above this amount get free shipping (0 = always free)</p>
            </div>
          </div>
          <Button onClick={savePricing} disabled={isSaving}>Save Pricing Settings</Button>
        </CardContent>
      </Card>

      {/* Operations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Operations</CardTitle>
              <CardDescription>Notifications, inventory alerts, and checkout options</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email alerts for new orders and events</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Guest Checkout</Label>
              <p className="text-sm text-muted-foreground">Let customers checkout without creating an account</p>
            </div>
            <Switch checked={allowGuestCheckout} onCheckedChange={setAllowGuestCheckout} />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Low Stock Alert Threshold
            </Label>
            <Input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-32"
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">Products with stock at or below this number are flagged as low stock</p>
          </div>
          <Button onClick={saveOperations} disabled={isSaving}>Save Operations Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
