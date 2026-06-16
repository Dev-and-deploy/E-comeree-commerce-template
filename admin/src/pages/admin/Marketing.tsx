import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid, formatDistanceToNow } from "date-fns";
import {
  Plus,
  Pencil,
  Trash2,
  Megaphone,
  Zap,
  ShoppingCart,
  MousePointerClick,
  Users,
  Crown,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Star,
  BarChart3,
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  SiGoogle,
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiX,
} from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { useCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";

import {
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetFlashSalesQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useDeleteFlashSaleMutation,
  useGetAbandonedCartsQuery,
  useUpdateAbandonedCartMutation,
  useDeleteAbandonedCartMutation,
  useGetPopUpsQuery,
  useCreatePopUpMutation,
  useUpdatePopUpMutation,
  useDeletePopUpMutation,
  useGetReferralsQuery,
  useCreateReferralMutation,
  useUpdateReferralMutation,
  useDeleteReferralMutation,
  useGetLoyaltyMembersQuery,
  useDeleteLoyaltyMemberMutation,
  useGetTrackingLinksQuery,
  useCreateTrackingLinkMutation,
  useUpdateTrackingLinkMutation,
  useDeleteTrackingLinkMutation,
} from "@/store/api/mockApi";

import type {
  Campaign,
  FlashSale,
  AbandonedCart,
  PopUp,
  Referral,
  LoyaltyMember,
  TrackingLink,
  TrackingChannel,
} from "@/store/api/mockData";

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmtDate(iso: string | undefined) {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "MMM d, yyyy") : "—";
}

function clientFilter<T extends Record<string, unknown>>(
  data: T[],
  params: URLSearchParams,
  config: {
    textKey: string;
    textFields: (keyof T)[];
    selects?: { param: string; field: keyof T }[];
  }
): T[] {
  let result = [...data];
  const q = params.get(config.textKey)?.toLowerCase();
  if (q)
    result = result.filter((item) =>
      config.textFields.some((f) => String(item[f] ?? "").toLowerCase().includes(q))
    );
  config.selects?.forEach(({ param, field }) => {
    const val = params.get(param);
    if (val) result = result.filter((item) => String(item[field]) === val);
  });
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder") ?? "desc";
  if (sortBy) {
    result.sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === "number" && typeof bv === "number")
        return sortOrder === "asc" ? av - bv : bv - av;
      return sortOrder === "asc"
        ? String(av ?? "").localeCompare(String(bv ?? ""))
        : String(bv ?? "").localeCompare(String(av ?? ""));
    });
  }
  return result;
}

function buildUtmUrl(
  baseUrl: string,
  p: { source: string; medium: string; campaign: string; content?: string; term?: string }
): string {
  if (!baseUrl) return "";
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    if (p.source) url.searchParams.set("utm_source", p.source.trim());
    if (p.medium) url.searchParams.set("utm_medium", p.medium.trim());
    if (p.campaign)
      url.searchParams.set("utm_campaign", p.campaign.trim().toLowerCase().replace(/\s+/g, "_"));
    if (p.content) url.searchParams.set("utm_content", p.content.trim());
    if (p.term) url.searchParams.set("utm_term", p.term.trim());
    return url.toString();
  } catch {
    const qs = new URLSearchParams();
    if (p.source) qs.set("utm_source", p.source.trim());
    if (p.medium) qs.set("utm_medium", p.medium.trim());
    if (p.campaign) qs.set("utm_campaign", p.campaign.trim().toLowerCase().replace(/\s+/g, "_"));
    if (p.content) qs.set("utm_content", p.content.trim());
    if (p.term) qs.set("utm_term", p.term.trim());
    return `${baseUrl}?${qs.toString()}`;
  }
}

// ─── Design Atoms ─────────────────────────────────────────────────────────────

/** Single dot status indicator */
function StatusDot({
  state,
}: {
  state: "active" | "warn" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full shrink-0",
        state === "active" && "bg-emerald-500",
        state === "warn" && "bg-amber-400",
        state === "muted" && "bg-muted-foreground/30"
      )}
    />
  );
}

function statusState(s: string): "active" | "warn" | "muted" {
  if (["active", "recovered", "live"].includes(s)) return "active";
  if (["paused", "pending", "scheduled"].includes(s)) return "warn";
  return "muted";
}

/** Inline status label */
function StatusLabel({ status, label }: { status: string; label?: string }) {
  const state = statusState(status);
  return (
    <span className="inline-flex items-center gap-1.5">
      <StatusDot state={state} />
      <span
        className={cn(
          "text-xs capitalize",
          state === "active" && "text-emerald-600 font-medium",
          state === "warn" && "text-amber-600 font-medium",
          state === "muted" && "text-muted-foreground"
        )}
      >
        {label ?? status}
      </span>
    </span>
  );
}

/** Monospace code pill for codes/slugs */
function CodePill({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-xs font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-foreground/80">
      {children}
    </code>
  );
}

/** Icon action button row */
function ActionBtn({
  onClick,
  tooltip,
  destructive,
  children,
}: {
  onClick: () => void;
  tooltip: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7",
            destructive && "text-destructive hover:text-destructive hover:bg-destructive/8"
          )}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
}) {
  return (
    <Card className="border-border hover:shadow-sm transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
            {title}
          </p>
          <Icon className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
        </div>
        <p className="text-2xl font-semibold tabular-nums mt-3 leading-none">{value}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
          {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
          {trend !== undefined && (
            <p
              className={cn(
                "text-xs tabular-nums shrink-0 ml-auto font-medium",
                trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {trend > 0 ? "+" : ""}{trend}%
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <ActionBtn
      tooltip={copied ? "Copied!" : "Copy URL"}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </ActionBtn>
  );
}

// ─── Channel Config ───────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<
  TrackingChannel,
  { label: string; icon: React.ElementType; color: string; defaultSource: string; defaultMedium: string }
> = {
  google:    { label: "Google Ads",  icon: SiGoogle,    color: "#4285F4", defaultSource: "google",       defaultMedium: "cpc" },
  facebook:  { label: "Facebook",    icon: SiFacebook,  color: "#1877F2", defaultSource: "facebook",     defaultMedium: "paid_social" },
  instagram: { label: "Instagram",   icon: SiInstagram, color: "#E4405F", defaultSource: "instagram",    defaultMedium: "paid_social" },
  tiktok:    { label: "TikTok",      icon: SiTiktok,    color: "#010101", defaultSource: "tiktok",       defaultMedium: "paid_social" },
  youtube:   { label: "YouTube",     icon: SiYoutube,   color: "#FF0000", defaultSource: "youtube",      defaultMedium: "video" },
  twitter:   { label: "Twitter / X", icon: SiX,         color: "#000000", defaultSource: "twitter",      defaultMedium: "paid_social" },
  influencer:{ label: "Influencer",  icon: Star,        color: "#F59E0B", defaultSource: "",             defaultMedium: "influencer" },
  email:     { label: "Email",       icon: Mail,        color: "#6366F1", defaultSource: "newsletter",   defaultMedium: "email" },
  other:     { label: "Other",       icon: Link2,       color: "#6B7280", defaultSource: "",             defaultMedium: "" },
};

const TRIGGER_LABELS: Record<string, string> = {
  exit_intent: "Exit Intent",
  time_delay: "Time Delay",
  scroll: "Scroll",
  page_load: "Page Load",
};

const GOAL_LABELS: Record<string, string> = {
  email_capture: "Email Capture",
  discount: "Discount",
  announcement: "Announcement",
};

const TIER_WEIGHT: Record<string, string> = {
  bronze: "text-muted-foreground",
  silver: "text-muted-foreground font-medium",
  gold: "text-foreground font-semibold",
  platinum: "text-foreground font-bold",
};

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── CAMPAIGNS TAB ───────────────────────────────────────────────────────────

function CampaignsTab() {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetCampaignsQuery();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();

  const EMPTY: Partial<Campaign> = { name: "", type: "email", status: "draft", budget: 0, startDate: "", endDate: "" };
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [viewItem, setViewItem] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Partial<Campaign>>(EMPTY);

  const data = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
    textKey: "name",
    textFields: ["name"],
    selects: [{ param: "type", field: "type" }, { param: "status", field: "status" }],
  }) as unknown as Campaign[];

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (c: Campaign) => { setEditTarget(c); setForm({ ...c }); setFormOpen(true); };

  const handleSubmit = async () => {
    try {
      if (editTarget) {
        await updateCampaign({ id: editTarget.id, ...form }).unwrap();
        toast({ title: "Campaign updated" });
      } else {
        await createCampaign({ ...form, reach: 0, clicks: 0, conversions: 0 }).unwrap();
        toast({ title: "Campaign created" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    }
  };

  const columns: DataTableColumn<Campaign>[] = [
    {
      key: "name",
      header: "Campaign",
      sortable: true,
      filter: { type: "text", paramKey: "name", placeholder: "Search campaigns…" },
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {fmtDate(row.startDate)} – {fmtDate(row.endDate)}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Channel",
      filter: {
        type: "select",
        paramKey: "type",
        options: [
          { label: "Email", value: "email" },
          { label: "SMS", value: "sms" },
          { label: "Push", value: "push" },
          { label: "Social", value: "social" },
        ],
      },
      cell: (row) => (
        <span className="text-xs text-muted-foreground capitalize">{row.type}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      filter: {
        type: "select",
        paramKey: "status",
        options: [
          { label: "Active", value: "active" },
          { label: "Paused", value: "paused" },
          { label: "Completed", value: "completed" },
          { label: "Draft", value: "draft" },
        ],
      },
      cell: (row) => <StatusLabel status={row.status} />,
    },
    {
      key: "reach",
      header: "Reach",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm">{row.reach.toLocaleString()}</span>,
    },
    {
      key: "conversions",
      header: "Conversions",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="tabular-nums text-sm font-medium">{row.conversions.toLocaleString()}</span>
          {row.reach > 0 && (
            <p className="text-xs text-muted-foreground">
              {((row.conversions / row.reach) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm">{symbol}{row.budget.toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}>
            <Info className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn tooltip="Edit" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn tooltip="Delete" destructive onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-3.5 w-3.5" />
          </ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable<Campaign>
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />New Campaign
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <Megaphone className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No campaigns yet</p>
            <Button onClick={openCreate} size="sm" variant="outline" className="gap-1.5 mt-1">
              <Plus className="h-4 w-4" />New Campaign
            </Button>
          </div>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Campaign" : "New Campaign"}</DialogTitle>
            <DialogDescription>
              {editTarget ? "Update campaign details." : "Create a new marketing campaign."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale Blast" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Campaign["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Campaign["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Budget ({symbol})</Label>
              <Input type="number" value={form.budget ?? 0} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTarget ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deleteCampaign(deleteTarget!.id); toast({ title: "Deleted" }); setDeleteTarget(null); }}
        title="Delete campaign?"
        description={<>Permanently remove <strong>"{deleteTarget?.name}"</strong>.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                <SheetTitle className="text-lg">{viewItem.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <StatusLabel status={viewItem.status} />
                  <span className="text-xs text-muted-foreground capitalize">· {viewItem.type}</span>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-xl font-bold tabular-nums mt-0.5">{symbol}{viewItem.budget.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Conversions</p><p className="text-xl font-bold tabular-nums mt-0.5">{viewItem.conversions.toLocaleString()}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Reach</p><p className="text-sm font-medium mt-0.5">{viewItem.reach.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">CVR</p><p className="text-sm font-medium mt-0.5">{viewItem.reach > 0 ? ((viewItem.conversions / viewItem.reach) * 100).toFixed(1) : 0}%</p></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.startDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground">End Date</p><p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.endDate)}</p></div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── FLASH SALES TAB ─────────────────────────────────────────────────────────

function FlashSalesTab() {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetFlashSalesQuery();
  const [createFlashSale] = useCreateFlashSaleMutation();
  const [updateFlashSale] = useUpdateFlashSaleMutation();
  const [deleteFlashSale] = useDeleteFlashSaleMutation();

  const EMPTY: Partial<FlashSale> = { name: "", discountPercent: 20, productCount: 0, status: "scheduled", startDate: "", endDate: "" };
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FlashSale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlashSale | null>(null);
  const [viewItem, setViewItem] = useState<FlashSale | null>(null);
  const [form, setForm] = useState<Partial<FlashSale>>(EMPTY);

  const data = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
    textKey: "fs_name",
    textFields: ["name"],
    selects: [{ param: "fs_status", field: "status" }],
  }) as unknown as FlashSale[];

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (fs: FlashSale) => { setEditTarget(fs); setForm({ ...fs }); setFormOpen(true); };

  const handleSubmit = async () => {
    try {
      if (editTarget) { await updateFlashSale({ id: editTarget.id, ...form }).unwrap(); toast({ title: "Updated" }); }
      else { await createFlashSale(form).unwrap(); toast({ title: "Flash sale created" }); }
      setFormOpen(false);
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const columns: DataTableColumn<FlashSale>[] = [
    {
      key: "name",
      header: "Sale",
      sortable: true,
      filter: { type: "text", paramKey: "fs_name", placeholder: "Search flash sales…" },
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{row.productCount} products</p>
        </div>
      ),
    },
    {
      key: "discountPercent",
      header: "Discount",
      sortable: true,
      cell: (row) => (
        <span className="text-sm font-bold tabular-nums">-{row.discountPercent}%</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      filter: {
        type: "select",
        paramKey: "fs_status",
        options: [
          { label: "Active", value: "active" },
          { label: "Scheduled", value: "scheduled" },
          { label: "Ended", value: "ended" },
        ],
      },
      cell: (row) => <StatusLabel status={row.status} />,
    },
    {
      key: "startDate",
      header: "Period",
      cell: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {fmtDate(row.startDate)} – {fmtDate(row.endDate)}
        </span>
      ),
    },
    {
      key: "ordersGenerated",
      header: "Orders",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm font-medium">{row.ordersGenerated.toLocaleString()}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm font-semibold">{symbol}{row.revenue.toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}><Info className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn tooltip="Edit" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn tooltip="Delete" destructive onClick={() => setDeleteTarget(row)}><Trash2 className="h-3.5 w-3.5" /></ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable<FlashSale>
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        toolbar={<Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New Flash Sale</Button>}
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <Zap className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No flash sales yet</p>
            <Button onClick={openCreate} size="sm" variant="outline" className="gap-1.5 mt-1"><Plus className="h-4 w-4" />Create Flash Sale</Button>
          </div>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Flash Sale" : "New Flash Sale"}</DialogTitle>
            <DialogDescription>Set up a limited-time discount event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Sale Name</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 24-Hour Blowout" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Discount %</Label>
                <Input type="number" min={1} max={99} value={form.discountPercent ?? 20} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Products</Label>
                <Input type="number" min={0} value={form.productCount ?? 0} onChange={(e) => setForm({ ...form, productCount: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as FlashSale["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTarget ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deleteFlashSale(deleteTarget!.id); toast({ title: "Deleted" }); setDeleteTarget(null); }}
        title="Delete flash sale?"
        description={<>Remove <strong>"{deleteTarget?.name}"</strong> permanently.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                <SheetTitle className="text-lg">{viewItem.name}</SheetTitle>
                <div className="mt-2"><StatusLabel status={viewItem.status} /></div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Discount</p><p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.discountPercent}%</p></div>
                    <div><p className="text-xs text-muted-foreground">Products</p><p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.productCount}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Orders</p><p className="text-sm font-medium mt-0.5">{viewItem.ordersGenerated.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-sm font-medium mt-0.5">{symbol}{viewItem.revenue.toLocaleString()}</p></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.startDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground">End Date</p><p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.endDate)}</p></div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── ABANDONED CART TAB ──────────────────────────────────────────────────────

function AbandonedCartTab() {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetAbandonedCartsQuery();
  const [updateCart] = useUpdateAbandonedCartMutation();
  const [deleteCart] = useDeleteAbandonedCartMutation();
  const [deleteTarget, setDeleteTarget] = useState<AbandonedCart | null>(null);
  const [viewItem, setViewItem] = useState<AbandonedCart | null>(null);

  const data = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
    textKey: "ac_customer",
    textFields: ["customer", "email"],
    selects: [{ param: "ac_status", field: "recoveryStatus" }],
  }) as unknown as AbandonedCart[];

  const pending = raw.filter((c) => c.recoveryStatus === "pending");
  const recovered = raw.filter((c) => c.recoveryStatus === "recovered");
  const recoveryRate = raw.length > 0 ? Math.round((recovered.length / raw.length) * 100) : 0;
  const atRisk = pending.reduce((s, c) => s + c.cartValue, 0);

  const columns: DataTableColumn<AbandonedCart>[] = [
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      filter: { type: "text", paramKey: "ac_customer", placeholder: "Search customers…" },
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.customer}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "cartValue",
      header: "Value",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm font-semibold">{symbol}{row.cartValue.toFixed(2)}</span>,
    },
    {
      key: "itemCount",
      header: "Items",
      cell: (row) => <span className="tabular-nums text-sm text-muted-foreground">{row.itemCount}</span>,
    },
    {
      key: "abandonedAt",
      header: "Abandoned",
      sortable: true,
      cell: (row) => {
        const d = parseISO(row.abandonedAt);
        return isValid(d)
          ? <span className="text-xs text-muted-foreground">{formatDistanceToNow(d, { addSuffix: true })}</span>
          : <span className="text-xs">—</span>;
      },
    },
    {
      key: "emailsSent",
      header: "Follow-ups",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Progress value={(row.emailsSent / 3) * 100} className="h-1 w-14" />
          <span className="text-xs tabular-nums text-muted-foreground">{row.emailsSent}/3</span>
        </div>
      ),
    },
    {
      key: "recoveryStatus",
      header: "Status",
      filter: {
        type: "select",
        paramKey: "ac_status",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Recovered", value: "recovered" },
          { label: "Lost", value: "lost" },
        ],
      },
      cell: (row) => <StatusLabel status={row.recoveryStatus} />,
    },
    {
      key: "actions",
      header: "",
      width: "110px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          {row.recoveryStatus === "pending" && row.emailsSent < 3 && (
            <ActionBtn
              tooltip="Send Recovery Email"
              onClick={async () => {
                await updateCart({ id: row.id, emailsSent: row.emailsSent + 1 }).unwrap();
                toast({ title: "Recovery email sent" });
              }}
            >
              <Send className="h-3.5 w-3.5" />
            </ActionBtn>
          )}
          {row.recoveryStatus === "pending" && (
            <ActionBtn
              tooltip="Mark Recovered"
              onClick={async () => {
                await updateCart({ id: row.id, recoveryStatus: "recovered" }).unwrap();
                toast({ title: "Marked as recovered" });
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </ActionBtn>
          )}
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}>
            <Info className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn tooltip="Remove" destructive onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-3.5 w-3.5" />
          </ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Pending", value: pending.length, sub: `${symbol}${atRisk.toFixed(0)} at risk` },
          { label: "Recovered", value: recovered.length, sub: `${symbol}${recovered.reduce((s, c) => s + c.cartValue, 0).toFixed(0)} saved` },
          { label: "Recovery Rate", value: `${recoveryRate}%`, sub: `${raw.length} total carts` },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-semibold tabular-nums mt-1.5">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable<AbandonedCart>
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No abandoned carts</p>
          </div>
        }
      />

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deleteCart(deleteTarget!.id); setDeleteTarget(null); }}
        title="Remove record?"
        description={<>Remove the abandoned cart for <strong>{deleteTarget?.customer}</strong>.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                <SheetTitle className="text-lg">{viewItem.customer}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{viewItem.email}</p>
                <div className="mt-2"><StatusLabel status={viewItem.recoveryStatus} /></div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Cart Value</p><p className="text-2xl font-bold tabular-nums mt-0.5">{symbol}{viewItem.cartValue.toFixed(2)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Items</p><p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.itemCount}</p></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Abandoned</p><p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.abandonedAt)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Emails Sent</p><p className="text-sm font-medium mt-0.5">{viewItem.emailsSent} / 3</p></div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── POP-UPS TAB ─────────────────────────────────────────────────────────────

function PopUpsTab() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetPopUpsQuery();
  const [createPopUp] = useCreatePopUpMutation();
  const [updatePopUp] = useUpdatePopUpMutation();
  const [deletePopUp] = useDeletePopUpMutation();

  const EMPTY: Partial<PopUp> = { name: "", trigger: "exit_intent", goal: "email_capture", status: "draft" };
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PopUp | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PopUp | null>(null);
  const [viewItem, setViewItem] = useState<PopUp | null>(null);
  const [form, setForm] = useState<Partial<PopUp>>(EMPTY);

  const data = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
    textKey: "pu_name",
    textFields: ["name"],
    selects: [{ param: "pu_trigger", field: "trigger" }, { param: "pu_status", field: "status" }],
  }) as unknown as PopUp[];

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (p: PopUp) => { setEditTarget(p); setForm({ ...p }); setFormOpen(true); };

  const handleSubmit = async () => {
    try {
      if (editTarget) { await updatePopUp({ id: editTarget.id, ...form }).unwrap(); toast({ title: "Updated" }); }
      else { await createPopUp(form).unwrap(); toast({ title: "Pop-up created" }); }
      setFormOpen(false);
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const columns: DataTableColumn<PopUp>[] = [
    {
      key: "name",
      header: "Pop-up",
      sortable: true,
      filter: { type: "text", paramKey: "pu_name", placeholder: "Search pop-ups…" },
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{GOAL_LABELS[row.goal]}</p>
        </div>
      ),
    },
    {
      key: "trigger",
      header: "Trigger",
      filter: {
        type: "select",
        paramKey: "pu_trigger",
        options: [
          { label: "Exit Intent", value: "exit_intent" },
          { label: "Time Delay", value: "time_delay" },
          { label: "Scroll", value: "scroll" },
          { label: "Page Load", value: "page_load" },
        ],
      },
      cell: (row) => <span className="text-xs text-muted-foreground">{TRIGGER_LABELS[row.trigger]}</span>,
    },
    {
      key: "status",
      header: "Status",
      filter: {
        type: "select",
        paramKey: "pu_status",
        options: [{ label: "Active", value: "active" }, { label: "Paused", value: "paused" }, { label: "Draft", value: "draft" }],
      },
      cell: (row) => <StatusLabel status={row.status} />,
    },
    {
      key: "impressions",
      header: "Impressions",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm">{row.impressions.toLocaleString()}</span>,
    },
    {
      key: "conversions",
      header: "Conversions",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="tabular-nums text-sm font-medium">{row.conversions.toLocaleString()}</span>
          {row.impressions > 0 && (
            <p className="text-xs text-muted-foreground">{((row.conversions / row.impressions) * 100).toFixed(1)}%</p>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => <span className="text-xs text-muted-foreground">{fmtDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          {row.status !== "draft" && (
            <ActionBtn
              tooltip={row.status === "active" ? "Pause" : "Activate"}
              onClick={async () => {
                const next = row.status === "active" ? "paused" : "active";
                await updatePopUp({ id: row.id, status: next }).unwrap();
                toast({ title: next === "active" ? "Activated" : "Paused" });
              }}
            >
              {row.status === "active" ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            </ActionBtn>
          )}
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}><Info className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn tooltip="Edit" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn tooltip="Delete" destructive onClick={() => setDeleteTarget(row)}><Trash2 className="h-3.5 w-3.5" /></ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable<PopUp>
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        toolbar={<Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New Pop-up</Button>}
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <MousePointerClick className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No pop-ups yet</p>
            <Button onClick={openCreate} size="sm" variant="outline" className="gap-1.5 mt-1"><Plus className="h-4 w-4" />Create Pop-up</Button>
          </div>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Pop-up" : "New Pop-up"}</DialogTitle>
            <DialogDescription>{editTarget ? "Update settings." : "Create a lead capture or promo pop-up."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Exit Intent Newsletter" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Trigger</Label>
                <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v as PopUp["trigger"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exit_intent">Exit Intent</SelectItem>
                    <SelectItem value="time_delay">Time Delay</SelectItem>
                    <SelectItem value="scroll">Scroll</SelectItem>
                    <SelectItem value="page_load">Page Load</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Goal</Label>
                <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v as PopUp["goal"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email_capture">Email Capture</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PopUp["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editTarget ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deletePopUp(deleteTarget!.id); toast({ title: "Deleted" }); setDeleteTarget(null); }}
        title="Delete pop-up?"
        description={<>Remove <strong>"{deleteTarget?.name}"</strong> permanently.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                <SheetTitle className="text-lg">{viewItem.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <StatusLabel status={viewItem.status} />
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Trigger</p><p className="text-sm font-medium mt-0.5">{TRIGGER_LABELS[viewItem.trigger] ?? viewItem.trigger}</p></div>
                    <div><p className="text-xs text-muted-foreground">Goal</p><p className="text-sm font-medium mt-0.5">{GOAL_LABELS[viewItem.goal] ?? viewItem.goal}</p></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Impressions</p><p className="text-xl font-bold tabular-nums mt-0.5">{viewItem.impressions.toLocaleString()}</p></div>
                    <div><p className="text-xs text-muted-foreground">Conversions</p><p className="text-xl font-bold tabular-nums mt-0.5">{viewItem.conversions.toLocaleString()}</p></div>
                  </div>
                  <div><p className="text-xs text-muted-foreground">Conversion Rate</p><p className="text-sm font-medium mt-0.5">{viewItem.impressions > 0 ? ((viewItem.conversions / viewItem.impressions) * 100).toFixed(1) : 0}%</p></div>
                  <Separator />
                  <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.createdAt)}</p></div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── REFERRALS TAB ───────────────────────────────────────────────────────────

function ReferralsTab() {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetReferralsQuery();
  const [createReferral] = useCreateReferralMutation();
  const [updateReferral] = useUpdateReferralMutation();
  const [deleteReferral] = useDeleteReferralMutation();

  const EMPTY: Partial<Referral> = { referrerName: "", referrerEmail: "", referralCode: "", status: "active" };
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Referral | null>(null);
  const [viewItem, setViewItem] = useState<Referral | null>(null);
  const [form, setForm] = useState<Partial<Referral>>(EMPTY);

  const data = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
    textKey: "rf_name",
    textFields: ["referrerName", "referrerEmail", "referralCode"],
    selects: [{ param: "rf_status", field: "status" }],
  }) as unknown as Referral[];

  const columns: DataTableColumn<Referral>[] = [
    {
      key: "referrerName",
      header: "Referrer",
      sortable: true,
      filter: { type: "text", paramKey: "rf_name", placeholder: "Search referrers…" },
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.referrerName}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.referrerEmail}</p>
        </div>
      ),
    },
    {
      key: "referralCode",
      header: "Code",
      cell: (row) => <CodePill>{row.referralCode}</CodePill>,
    },
    {
      key: "referralsSent",
      header: "Sent",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm">{row.referralsSent}</span>,
    },
    {
      key: "successfulReferrals",
      header: "Converted",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="tabular-nums text-sm font-medium">{row.successfulReferrals}</span>
          {row.referralsSent > 0 && (
            <p className="text-xs text-muted-foreground">
              {Math.round((row.successfulReferrals / row.referralsSent) * 100)}%
            </p>
          )}
        </div>
      ),
    },
    {
      key: "totalEarned",
      header: "Earned",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm font-semibold">{symbol}{row.totalEarned.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      filter: {
        type: "select",
        paramKey: "rf_status",
        options: [{ label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }],
      },
      cell: (row) => <StatusLabel status={row.status} />,
    },
    {
      key: "joinedAt",
      header: "Joined",
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{fmtDate(row.joinedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ActionBtn
            tooltip={row.status === "active" ? "Suspend" : "Activate"}
            onClick={async () => {
              const next = row.status === "active" ? "suspended" : "active";
              await updateReferral({ id: row.id, status: next }).unwrap();
              toast({ title: next === "active" ? "Activated" : "Suspended" });
            }}
          >
            {row.status === "active" ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </ActionBtn>
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}>
            <Info className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn tooltip="Remove" destructive onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-3.5 w-3.5" />
          </ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable<Referral>
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        toolbar={
          <Button onClick={() => { setForm(EMPTY); setFormOpen(true); }} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />Add Referrer
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <Users className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No referral partners yet</p>
          </div>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Referral Partner</DialogTitle>
            <DialogDescription>Enrol a customer into the referral program.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.referrerName ?? ""} onChange={(e) => setForm({ ...form, referrerName: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.referrerEmail ?? ""} onChange={(e) => setForm({ ...form, referrerEmail: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Referral Code</Label>
              <Input value={form.referralCode ?? ""} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} placeholder="e.g. ALICE20" className="font-mono uppercase" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await createReferral(form).unwrap();
                toast({ title: "Partner added" });
                setFormOpen(false);
                setForm(EMPTY);
              } catch { toast({ title: "Error", variant: "destructive" }); }
            }}>Add Partner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deleteReferral(deleteTarget!.id); toast({ title: "Removed" }); setDeleteTarget(null); }}
        title="Remove referral partner?"
        description={<>Remove <strong>{deleteTarget?.referrerName}</strong> from the program.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                <SheetTitle className="text-lg">{viewItem.referrerName}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{viewItem.referrerEmail}</p>
                <div className="mt-2"><StatusLabel status={viewItem.status} /></div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Referral Code</p>
                    <CodePill>{viewItem.referralCode}</CodePill>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Referrals Sent</p>
                      <p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.referralsSent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Converted</p>
                      <p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.successfulReferrals}</p>
                      {viewItem.referralsSent > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Math.round((viewItem.successfulReferrals / viewItem.referralsSent) * 100)}% rate
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-sm font-semibold mt-0.5">{symbol}{viewItem.totalEarned.toLocaleString()}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.joinedAt)}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── LOYALTY TAB ─────────────────────────────────────────────────────────────

function LoyaltyTab() {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetLoyaltyMembersQuery();
  const [deleteMember] = useDeleteLoyaltyMemberMutation();
  const [deleteTarget, setDeleteTarget] = useState<LoyaltyMember | null>(null);
  const [viewItem, setViewItem] = useState<LoyaltyMember | null>(null);

  const data = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
    textKey: "ly_name",
    textFields: ["name", "email"],
    selects: [{ param: "ly_tier", field: "tier" }],
  }) as unknown as LoyaltyMember[];

  const totalPoints = raw.reduce((s, m) => s + m.points, 0);

  const columns: DataTableColumn<LoyaltyMember>[] = [
    {
      key: "name",
      header: "Member",
      sortable: true,
      filter: { type: "text", paramKey: "ly_name", placeholder: "Search members…" },
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      filter: {
        type: "select",
        paramKey: "ly_tier",
        options: [{ label: "Bronze", value: "bronze" }, { label: "Silver", value: "silver" }, { label: "Gold", value: "gold" }, { label: "Platinum", value: "platinum" }],
      },
      cell: (row) => (
        <span className={cn("text-xs capitalize inline-flex items-center gap-1", TIER_WEIGHT[row.tier])}>
          {row.tier === "platinum" && <Crown className="h-3 w-3" />}
          {row.tier}
        </span>
      ),
    },
    {
      key: "points",
      header: "Points",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm font-semibold">{row.points.toLocaleString()}</span>,
    },
    {
      key: "totalSpent",
      header: "Spent",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm">{symbol}{row.totalSpent.toLocaleString()}</span>,
    },
    {
      key: "redemptions",
      header: "Redemptions",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm text-muted-foreground">{row.redemptions}</span>,
    },
    {
      key: "joinedAt",
      header: "Member Since",
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{fmtDate(row.joinedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}>
            <Info className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn tooltip="Remove" destructive onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-3.5 w-3.5" />
          </ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Tier summary — clean table-style */}
      <div className="rounded-xl border border-border overflow-hidden mb-5">
        <div className="grid grid-cols-4 divide-x divide-border">
          {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => {
            const count = raw.filter((m) => m.tier === tier).length;
            return (
              <div key={tier} className="px-5 py-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{tier}</p>
                <p className="text-2xl font-semibold tabular-nums mt-1.5">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {count === 1 ? "member" : "members"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <DataTable<LoyaltyMember>
        columns={columns}
        data={data}
        loading={isLoading}
        rowKey={(r) => r.id}
        toolbar={
          <p className="text-xs text-muted-foreground">
            {totalPoints.toLocaleString()} pts outstanding
          </p>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <Crown className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No loyalty members yet</p>
          </div>
        }
      />

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deleteMember(deleteTarget!.id); toast({ title: "Member removed" }); setDeleteTarget(null); }}
        title="Remove loyalty member?"
        description={<>Remove <strong>{deleteTarget?.name}</strong>. Their points will be forfeited.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                <SheetTitle className="text-lg">{viewItem.name}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{viewItem.email}</p>
                <div className="mt-2">
                  <span className={cn("text-xs capitalize inline-flex items-center gap-1 font-medium", TIER_WEIGHT[viewItem.tier])}>
                    {viewItem.tier === "platinum" && <Crown className="h-3 w-3" />}
                    {viewItem.tier}
                  </span>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Points</p>
                      <p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.points.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Redemptions</p>
                      <p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.redemptions}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-sm font-semibold mt-0.5">{symbol}{viewItem.totalSpent.toLocaleString()}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <p className="text-sm font-medium mt-0.5">{fmtDate(viewItem.joinedAt)}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── ATTRIBUTION TAB ─────────────────────────────────────────────────────────

const ALL_CHANNELS: (TrackingChannel | "all")[] = [
  "all", "google", "facebook", "instagram", "tiktok", "youtube", "twitter", "influencer", "email", "other",
];

function AttributionTab() {
  const { toast } = useToast();
  const symbol = useCurrencySymbol();
  const [searchParams] = useSearchParams();
  const { data: raw = [], isLoading } = useGetTrackingLinksQuery();
  const [createLink] = useCreateTrackingLinkMutation();
  const [updateLink] = useUpdateTrackingLinkMutation();
  const [deleteLink] = useDeleteTrackingLinkMutation();

  const [channelFilter, setChannelFilter] = useState<TrackingChannel | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TrackingLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrackingLink | null>(null);
  const [viewItem, setViewItem] = useState<TrackingLink | null>(null);

  const EMPTY_FORM: Partial<TrackingLink> = {
    name: "", channel: "google", influencerHandle: "", baseUrl: "",
    utmSource: "google", utmMedium: "cpc", utmCampaign: "", utmContent: "", utmTerm: "", status: "active",
  };
  const [form, setForm] = useState<Partial<TrackingLink>>(EMPTY_FORM);

  const previewUrl = useMemo(
    () => buildUtmUrl(form.baseUrl ?? "", {
      source: form.utmSource ?? "", medium: form.utmMedium ?? "",
      campaign: form.utmCampaign ?? "", content: form.utmContent, term: form.utmTerm,
    }),
    [form.baseUrl, form.utmSource, form.utmMedium, form.utmCampaign, form.utmContent, form.utmTerm]
  );

  const handleChannelChange = (ch: TrackingChannel) => {
    const cfg = CHANNEL_CONFIG[ch];
    setForm((f) => ({ ...f, channel: ch, utmSource: cfg.defaultSource, utmMedium: cfg.defaultMedium }));
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (tl: TrackingLink) => { setEditTarget(tl); setForm({ ...tl }); setFormOpen(true); };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, generatedUrl: previewUrl };
      if (editTarget) { await updateLink({ id: editTarget.id, ...payload }).unwrap(); toast({ title: "Updated" }); }
      else { await createLink(payload).unwrap(); toast({ title: "Tracking link created" }); }
      setFormOpen(false);
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const filtered = useMemo(() => {
    let items = clientFilter(raw as unknown as Record<string, unknown>[], searchParams, {
      textKey: "at_name",
      textFields: ["name", "utmCampaign", "influencerHandle"],
    }) as unknown as TrackingLink[];
    if (channelFilter !== "all") items = items.filter((tl) => tl.channel === channelFilter);
    return items;
  }, [raw, searchParams, channelFilter]);

  const channelStats = useMemo(() =>
    (Object.keys(CHANNEL_CONFIG) as TrackingChannel[])
      .map((ch) => {
        const links = raw.filter((tl) => tl.channel === ch);
        return {
          channel: ch,
          count: links.length,
          visits: links.reduce((s, l) => s + l.visits, 0),
          orders: links.reduce((s, l) => s + l.orders, 0),
          revenue: links.reduce((s, l) => s + l.revenue, 0),
        };
      })
      .filter((s) => s.count > 0)
      .sort((a, b) => b.revenue - a.revenue),
    [raw]
  );

  const totals = useMemo(() => ({
    visits: raw.reduce((s, l) => s + l.visits, 0),
    orders: raw.reduce((s, l) => s + l.orders, 0),
    revenue: raw.reduce((s, l) => s + l.revenue, 0),
  }), [raw]);

  const columns: DataTableColumn<TrackingLink>[] = [
    {
      key: "name",
      header: "Link",
      sortable: true,
      filter: { type: "text", paramKey: "at_name", placeholder: "Search links…" },
      cell: (row) => {
        const cfg = CHANNEL_CONFIG[row.channel];
        const Icon = cfg.icon;
        return (
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-1.5 rounded-md border border-border bg-muted/40 shrink-0 mt-0.5">
              <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate max-w-[200px]">{row.name}</p>
              {row.influencerHandle && (
                <p className="text-xs text-muted-foreground mt-0.5">{row.influencerHandle}</p>
              )}
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[220px]" title={row.utmCampaign}>
                {row.utmCampaign || row.utmSource}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "channel",
      header: "Channel",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{CHANNEL_CONFIG[row.channel].label}</span>
      ),
    },
    {
      key: "visits",
      header: "Visits",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm">{row.visits.toLocaleString()}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      sortable: true,
      cell: (row) => (
        <div>
          <span className="tabular-nums text-sm font-medium">{row.orders.toLocaleString()}</span>
          {row.visits > 0 && (
            <p className="text-xs text-muted-foreground">{((row.orders / row.visits) * 100).toFixed(1)}% CVR</p>
          )}
        </div>
      ),
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      cell: (row) => <span className="tabular-nums text-sm font-semibold">{symbol}{row.revenue.toLocaleString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusLabel status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <CopyButton text={row.generatedUrl} />
          <ActionBtn
            tooltip={row.status === "active" ? "Pause" : "Activate"}
            onClick={async () => {
              const next = row.status === "active" ? "paused" : "active";
              await updateLink({ id: row.id, status: next }).unwrap();
              toast({ title: next === "active" ? "Activated" : "Paused" });
            }}
          >
            {row.status === "active" ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </ActionBtn>
          <ActionBtn tooltip="View details" onClick={() => setViewItem(row)}><Info className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn tooltip="Edit" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn tooltip="Delete" destructive onClick={() => setDeleteTarget(row)}><Trash2 className="h-3.5 w-3.5" /></ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Visits", value: totals.visits.toLocaleString(), icon: ArrowUpRight },
          { label: "Attributed Orders", value: totals.orders.toLocaleString(), icon: ShoppingCart },
          { label: "Attributed Revenue", value: `${symbol}${totals.revenue.toLocaleString()}`, icon: BarChart3 },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-semibold tabular-nums mt-1.5">{s.value}</p>
                </div>
                <s.icon className="h-4 w-4 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Channel breakdown — clean rows, no color */}
      <div className="rounded-xl border border-border mb-5">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue by Channel</p>
        </div>
        <div className="divide-y divide-border">
          {channelStats.map((s) => {
            const cfg = CHANNEL_CONFIG[s.channel];
            const Icon = cfg.icon;
            const pct = totals.revenue > 0 ? (s.revenue / totals.revenue) * 100 : 0;
            return (
              <div key={s.channel} className="flex items-center gap-4 px-5 py-3">
                <div className="flex items-center gap-2.5 w-36 shrink-0">
                  <div className="p-1.5 rounded-md border border-border bg-muted/40">
                    <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                  </div>
                  <span className="text-sm font-medium truncate">{cfg.label}</span>
                </div>
                <div className="flex-1">
                  <Progress value={pct} className="h-1" />
                </div>
                <div className="flex items-center gap-5 shrink-0 text-xs tabular-nums">
                  <span className="text-muted-foreground w-20 text-right">{s.visits.toLocaleString()} visits</span>
                  <span className="text-muted-foreground w-16 text-right">{s.orders.toLocaleString()} orders</span>
                  <span className="font-semibold w-20 text-right">{symbol}{s.revenue.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How tracking works — minimal note */}
      <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 mb-5">
        <p className="text-xs font-medium text-foreground mb-0.5">How attribution tracking works</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Each link embeds UTM parameters. When a visitor arrives via the link, their session is tagged. Any order placed during that session is attributed to this link — giving you full source-to-sale visibility.
        </p>
      </div>

      {/* Channel filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {ALL_CHANNELS.map((ch) => {
          const count = ch === "all" ? raw.length : raw.filter((tl) => tl.channel === ch).length;
          if (count === 0 && ch !== "all") return null;
          const label = ch === "all" ? "All" : CHANNEL_CONFIG[ch].label;
          const active = channelFilter === ch;
          return (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {label}
              <span className={cn("tabular-nums ml-0.5", active ? "opacity-70" : "text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable<TrackingLink>
        columns={columns}
        data={filtered}
        loading={isLoading}
        rowKey={(r) => r.id}
        toolbar={
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />New Tracking Link
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center gap-3 py-12">
            <Link2 className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No tracking links yet</p>
            <p className="text-xs text-muted-foreground">Generate UTM links to track where customers come from</p>
            <Button onClick={openCreate} size="sm" variant="outline" className="gap-1.5 mt-1">
              <Plus className="h-4 w-4" />New Tracking Link
            </Button>
          </div>
        }
      />

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Tracking Link" : "New Tracking Link"}</DialogTitle>
            <DialogDescription>
              Build a UTM-tagged URL to track visits and orders from any channel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>Link Name</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Google Summer Sale – Search"
              />
            </div>

            {/* Channel grid — inverted on selection, no color */}
            <div className="space-y-1.5">
              <Label>Channel</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(CHANNEL_CONFIG) as TrackingChannel[]).map((ch) => {
                  const cfg = CHANNEL_CONFIG[ch];
                  const Icon = cfg.icon;
                  const active = form.channel === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleChannelChange(ch)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        style={active ? undefined : { color: cfg.color }}
                      />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {form.channel === "influencer" && (
              <div className="space-y-1.5">
                <Label>Influencer Handle</Label>
                <Input value={form.influencerHandle ?? ""} onChange={(e) => setForm({ ...form, influencerHandle: e.target.value })} placeholder="@username" />
              </div>
            )}

            <Separator />

            <div className="space-y-1.5">
              <Label>Destination URL</Label>
              <Input
                value={form.baseUrl ?? ""}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://yourstore.com/landing"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">UTM Parameters</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">utm_source</Label>
                  <Input value={form.utmSource ?? ""} onChange={(e) => setForm({ ...form, utmSource: e.target.value })} placeholder="google" className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">utm_medium</Label>
                  <Input value={form.utmMedium ?? ""} onChange={(e) => setForm({ ...form, utmMedium: e.target.value })} placeholder="cpc" className="font-mono text-xs" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">utm_campaign</Label>
                  <Input value={form.utmCampaign ?? ""} onChange={(e) => setForm({ ...form, utmCampaign: e.target.value })} placeholder="summer_sale_2026" className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    utm_content <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                  </Label>
                  <Input value={form.utmContent ?? ""} onChange={(e) => setForm({ ...form, utmContent: e.target.value })} placeholder="banner_v1" className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    utm_term <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                  </Label>
                  <Input value={form.utmTerm ?? ""} onChange={(e) => setForm({ ...form, utmTerm: e.target.value })} placeholder="summer fashion" className="font-mono text-xs" />
                </div>
              </div>
            </div>

            {/* Generated URL preview */}
            {previewUrl && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated URL</p>
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs font-mono text-foreground break-all flex-1 leading-relaxed">{previewUrl}</p>
                  <CopyButton text={previewUrl} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name || !form.baseUrl || !form.utmSource || !form.utmCampaign}
            >
              {editTarget ? "Save Changes" : "Create Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={async () => { await deleteLink(deleteTarget!.id); toast({ title: "Deleted" }); setDeleteTarget(null); }}
        title="Delete tracking link?"
        description={<>Remove <strong>"{deleteTarget?.name}"</strong>. Attribution data will be lost.</>}
      />

      <Sheet open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <SheetContent className="w-[420px] sm:w-[480px] p-0">
          {viewItem && (() => {
            const cfg = CHANNEL_CONFIG[viewItem.channel];
            const Icon = cfg.icon;
            return (
              <div className="flex flex-col h-full">
                <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border border-border bg-muted/40 shrink-0">
                      <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0">
                      <SheetTitle className="text-lg leading-tight truncate">{viewItem.name}</SheetTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
                    </div>
                  </div>
                  <div className="mt-2"><StatusLabel status={viewItem.status} /></div>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Visits</p>
                        <p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.visits.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="text-2xl font-bold tabular-nums mt-0.5">{viewItem.orders.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CVR</p>
                        <p className="text-2xl font-bold tabular-nums mt-0.5">
                          {viewItem.visits > 0 ? ((viewItem.orders / viewItem.visits) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-xl font-semibold tabular-nums mt-0.5">{symbol}{viewItem.revenue.toLocaleString()}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">UTM Parameters</p>
                      <div className="space-y-2">
                        {[
                          { label: "utm_source", value: viewItem.utmSource },
                          { label: "utm_medium", value: viewItem.utmMedium },
                          { label: "utm_campaign", value: viewItem.utmCampaign },
                          { label: "utm_content", value: viewItem.utmContent },
                          { label: "utm_term", value: viewItem.utmTerm },
                        ].filter((p) => p.value).map((p) => (
                          <div key={p.label} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-28 shrink-0">{p.label}</span>
                            <span className="text-xs font-mono bg-muted/60 px-2 py-0.5 rounded truncate">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {viewItem.generatedUrl && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Generated URL</p>
                          <p className="text-xs font-mono text-foreground break-all leading-relaxed bg-muted/40 rounded-lg px-3 py-2.5">
                            {viewItem.generatedUrl}
                          </p>
                        </div>
                      </>
                    )}
                    {viewItem.influencerHandle && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs text-muted-foreground">Influencer</p>
                          <p className="text-sm font-medium mt-0.5">{viewItem.influencerHandle}</p>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const Marketing = () => {
  const symbol = useCurrencySymbol();
  const { data: campaigns = [] } = useGetCampaignsQuery();
  const { data: flashSales = [] } = useGetFlashSalesQuery();
  const { data: abandonedCarts = [] } = useGetAbandonedCartsQuery();
  const { data: popUps = [] } = useGetPopUpsQuery();
  const { data: referrals = [] } = useGetReferralsQuery();
  const { data: loyaltyMembers = [] } = useGetLoyaltyMembersQuery();
  const { data: trackingLinks = [] } = useGetTrackingLinksQuery();

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const pendingCarts = abandonedCarts.filter((c) => c.recoveryStatus === "pending").length;
  const recoveredCarts = abandonedCarts.filter((c) => c.recoveryStatus === "recovered").length;
  const recoveryRate = abandonedCarts.length > 0
    ? Math.round((recoveredCarts / abandonedCarts.length) * 100) : 0;
  const totalImpressions = popUps.reduce((s, p) => s + p.impressions, 0);
  const totalConversions = popUps.reduce((s, p) => s + p.conversions, 0);
  const popupCvr = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "—";
  const attributedRevenue = trackingLinks.reduce((s, l) => s + l.revenue, 0);
  const activeLinks = trackingLinks.filter((l) => l.status === "active").length;

  const tabCounts = {
    campaigns: campaigns.length,
    attribution: trackingLinks.length,
    flashsales: flashSales.length,
    abandonedcart: pendingCarts,
    popups: popUps.filter((p) => p.status === "active").length,
    referrals: referrals.filter((r) => r.status === "active").length,
    loyalty: loyaltyMembers.length,
  };

  const tabs = [
    { value: "campaigns",     icon: Megaphone,         label: "Campaigns",      count: tabCounts.campaigns },
    { value: "attribution",   icon: BarChart3,          label: "Attribution",    count: tabCounts.attribution },
    { value: "flashsales",    icon: Zap,               label: "Flash Sales",    count: tabCounts.flashsales },
    { value: "abandonedcart", icon: ShoppingCart,       label: "Abandoned Cart", count: tabCounts.abandonedcart },
    { value: "popups",        icon: MousePointerClick,  label: "Pop-ups",        count: tabCounts.popups },
    { value: "referrals",     icon: Users,             label: "Referrals",      count: tabCounts.referrals },
    { value: "loyalty",       icon: Crown,             label: "Loyalty",        count: tabCounts.loyalty },
  ] as const;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeCampaigns} active campaigns · {activeLinks} tracking links · {loyaltyMembers.length} loyalty members
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Active Campaigns" value={activeCampaigns} sub={`${(totalReach / 1000).toFixed(0)}k reach`} icon={Megaphone} trend={12} />
        <StatCard title="Flash Sales" value={flashSales.filter((f) => f.status === "active").length} sub={`${flashSales.length} total`} icon={Zap} trend={5} />
        <StatCard title="Abandoned Carts" value={pendingCarts} sub={`${recoveryRate}% recovery rate`} icon={ShoppingCart} trend={-3} />
        <StatCard title="Pop-up CVR" value={`${popupCvr}%`} sub={`${totalConversions.toLocaleString()} conversions`} icon={MousePointerClick} trend={8} />
        <StatCard title="Attributed Revenue" value={`${symbol}${(attributedRevenue / 1000).toFixed(0)}k`} sub={`${activeLinks} active links`} icon={BarChart3} trend={18} />
        <StatCard title="Loyalty Members" value={loyaltyMembers.length} sub={`${loyaltyMembers.filter((m) => m.tier === "platinum").length} platinum`} icon={Crown} trend={6} />
      </div>

      {/* Tabs — underline style */}
      <Tabs defaultValue="campaigns">
        <div className="border-b border-border">
          <TabsList className="h-auto bg-transparent p-0 gap-0 w-full justify-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative rounded-none border-b-2 border-transparent",
                  "px-4 py-2.5 text-xs font-medium text-muted-foreground gap-1.5",
                  "data-[state=active]:border-foreground data-[state=active]:text-foreground",
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "hover:text-foreground transition-colors"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground leading-none">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="pt-5">
          <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
          <TabsContent value="attribution"><AttributionTab /></TabsContent>
          <TabsContent value="flashsales"><FlashSalesTab /></TabsContent>
          <TabsContent value="abandonedcart"><AbandonedCartTab /></TabsContent>
          <TabsContent value="popups"><PopUpsTab /></TabsContent>
          <TabsContent value="referrals"><ReferralsTab /></TabsContent>
          <TabsContent value="loyalty"><LoyaltyTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Marketing;
