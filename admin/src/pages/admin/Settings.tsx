import { useAppSelector, useAppDispatch } from "@/store/store";
import { setTheme } from "@/store/slices/themeSlice";
import { setUser } from "@/store/slices/authSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Palette, Globe, Bell } from "lucide-react";
import { useState } from "react";
import { UserRole } from "@/store/slices/authSlice";

const Settings = () => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((s) => s.theme);
  const { user } = useAppSelector((s) => s.auth);
  const [siteTitle, setSiteTitle] = useState("My E-Commerce Store");
  const [siteDescription, setSiteDescription] = useState("The best online store for fashion and lifestyle products.");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Super Admin configuration panel</p>
        <Badge variant="outline" className="mt-2"><Shield className="h-3 w-3 mr-1" />Super Admin Only</Badge>
      </div>

      {/* Theme Settings */}
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
            <Switch checked={mode === "dark"} onCheckedChange={(checked) => dispatch(setTheme(checked ? "dark" : "light"))} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => dispatch(setTheme("light"))} className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${mode === "light" ? "border-primary" : "border-border"}`}>
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-foreground/80" />
                <div className="h-2 w-24 rounded bg-muted-foreground/30" />
                <div className="h-8 rounded bg-muted" />
                <div className="h-2 w-20 rounded bg-muted-foreground/20" />
              </div>
              <p className="mt-3 text-center text-sm font-medium">Light</p>
            </div>
            <div onClick={() => dispatch(setTheme("dark"))} className={`cursor-pointer rounded-lg border-2 p-4 transition-all bg-foreground/5 ${mode === "dark" ? "border-primary" : "border-border"}`}>
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
            <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Site Description</Label>
            <Input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable the storefront</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email alerts for orders and events</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Role Simulation</CardTitle>
              <CardDescription>Switch roles to test access control (mock only)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Current Role</Label>
            <Select
              value={user?.role}
              onValueChange={(v) => user && dispatch(setUser({ ...user, role: v as UserRole }))}
            >
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Changing role will affect sidebar visibility. Settings is super_admin only.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
