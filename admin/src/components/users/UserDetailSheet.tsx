import { format, parseISO, isValid } from "date-fns";
import { Pencil, Trash2, Mail, Phone, ShieldCheck, Calendar, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User } from "@/store/api/userApi";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
  ADMIN: { label: "Admin", variant: "default" },
  EDITOR: { label: "Editor", variant: "secondary" },
  CUSTOMER: { label: "Customer", variant: "outline" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "MMM d, yyyy, h:mm a") : "—";
}

// ─── Shared detail row ────────────────────────────────────────────────────────

export function DetailRow({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 p-1.5 rounded-md border border-border bg-muted/40 shrink-0">
          <Icon className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-sm font-medium break-all mt-0.5",
            mono && "font-mono text-xs"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

// ─── UserDetailSheet ──────────────────────────────────────────────────────────

interface UserDetailSheetProps {
  user: User;
  currentUserId?: string;
  isSuperAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function UserDetailSheet({
  user,
  currentUserId,
  isSuperAdmin,
  onEdit,
  onDelete,
}: UserDetailSheetProps) {
  const roleCfg = ROLE_CONFIG[user.role] ?? { label: user.role, variant: "outline" as const };
  const canModify = isSuperAdmin && user.id !== currentUserId;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader className="px-6 pt-6 pb-5 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 shrink-0 border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-base font-semibold bg-muted">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <SheetTitle className="text-lg leading-tight truncate">{user.name}</SheetTitle>
            <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant={roleCfg.variant} className="text-xs">
            {roleCfg.label}
          </Badge>
          {user.isActive ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-600 font-medium">Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
              <span className="text-xs text-muted-foreground">Inactive</span>
            </span>
          )}
        </div>
      </SheetHeader>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-5">
          {/* Contact */}
          <div className="space-y-3">
            <SectionLabel>Contact</SectionLabel>
            <DetailRow label="Email" value={user.email} icon={Mail} />
            {user.phone && (
              <DetailRow label="Phone" value={user.phone} icon={Phone} />
            )}
          </div>

          <Separator />

          {/* Account */}
          <div className="space-y-3">
            <SectionLabel>Account</SectionLabel>
            <DetailRow label="Role" value={roleCfg.label} icon={ShieldCheck} />
            <DetailRow label="User ID" value={user.id} icon={Hash} mono />
            <DetailRow label="Member since" value={fmtDate(user.createdAt)} icon={Calendar} />
            {user.updatedAt && (
              <DetailRow label="Last updated" value={fmtDate(user.updatedAt)} icon={Calendar} />
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer actions */}
      {canModify && (
        <div className="px-6 py-4 border-t shrink-0 flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 flex-1"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
