import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DataTableFilterConfig {
  type: "text" | "select" | "date-range" | "boolean";
  /** URL param key. Defaults to column key. Date-range appends _from / _to. */
  paramKey?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  filter?: DataTableFilterConfig;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
}

export interface DataTablePaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  pagination?: DataTablePaginationMeta;
  loading?: boolean;
  toolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  rowKey?: (row: T) => string;
  className?: string;
}

const LIMIT_OPTIONS = ["10", "25", "50", "100"];

// ─── Helper: page numbers with ellipsis ──────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({
  col,
  currentSort,
  currentOrder,
}: {
  col: string;
  currentSort: string;
  currentOrder: string;
}) {
  if (currentSort !== col)
    return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-40" />;
  return currentOrder === "asc" ? (
    <ChevronUp className="ml-1 h-3.5 w-3.5 shrink-0 text-primary" />
  ) : (
    <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 text-primary" />
  );
}

// ─── Text Filter ──────────────────────────────────────────────────────────────

function TextFilter({
  paramKey,
  placeholder,
}: {
  paramKey: string;
  placeholder?: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get(paramKey) ?? "";
  const [local, setLocal] = useState(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(searchParams.get(paramKey) ?? "");
  }, [searchParams, paramKey]);

  const push = (val: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        val ? p.set(paramKey, val) : p.delete(paramKey);
        p.set("page", "1");
        return p;
      });
    }, 380);
  };

  return (
    <div className="relative">
      <Input
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          push(e.target.value);
        }}
        placeholder={placeholder ?? "Filter…"}
        className="h-7 text-xs pr-6 bg-background"
      />
      {local && (
        <button
          onClick={() => {
            setLocal("");
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev);
              p.delete(paramKey);
              p.set("page", "1");
              return p;
            });
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Select / Boolean Filter ─────────────────────────────────────────────────

function SelectFilter({
  paramKey,
  placeholder,
  options,
}: {
  paramKey: string;
  placeholder?: string;
  options: { label: string; value: string }[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  return (
    <Select
      value={current || "__all__"}
      onValueChange={(val) =>
        setSearchParams((prev) => {
          const p = new URLSearchParams(prev);
          val && val !== "__all__" ? p.set(paramKey, val) : p.delete(paramKey);
          p.set("page", "1");
          return p;
        })
      }
    >
      <SelectTrigger className="h-7 text-xs bg-background">
        <SelectValue placeholder={placeholder ?? "All"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Date Range Filter ────────────────────────────────────────────────────────

function DateRangeFilter({ paramKey }: { paramKey: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const fromKey = `${paramKey}_from`;
  const toKey = `${paramKey}_to`;
  const fromStr = searchParams.get(fromKey);
  const toStr = searchParams.get(toKey);
  const from = fromStr && isValid(parseISO(fromStr)) ? parseISO(fromStr) : undefined;
  const to = toStr && isValid(parseISO(toStr)) ? parseISO(toStr) : undefined;

  const apply = (range?: { from?: Date; to?: Date }) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      range?.from ? p.set(fromKey, format(range.from, "yyyy-MM-dd")) : p.delete(fromKey);
      if (range?.to) {
        p.set(toKey, format(range.to, "yyyy-MM-dd"));
      } else {
        p.delete(toKey);
      }
      p.set("page", "1");
      return p;
    });
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    apply();
  };

  const label =
    from && to
      ? `${format(from, "MMM d")} – ${format(to, "MMM d, yy")}`
      : from
        ? `From ${format(from, "MMM d, yy")}`
        : "Date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 w-full justify-start text-left font-normal text-xs px-2 bg-background",
            !from && !to && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3 shrink-0" />
          <span className="truncate flex-1">{label}</span>
          {(from || to) && (
            <X className="ml-1 h-3 w-3 shrink-0" onClick={clear} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(r) => apply(r as { from?: Date; to?: Date })}
          numberOfMonths={2}
          initialFocus
        />
        {(from || to) && (
          <div className="p-2 border-t flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => { apply(); setOpen(false); }}>
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Filter Cell dispatcher ───────────────────────────────────────────────────

function FilterCell({
  filter,
  columnKey,
}: {
  filter: DataTableFilterConfig;
  columnKey: string;
}) {
  const key = filter.paramKey ?? columnKey;
  switch (filter.type) {
    case "date-range":
      return <DateRangeFilter paramKey={key} />;
    case "boolean":
      return (
        <SelectFilter
          paramKey={key}
          placeholder={filter.placeholder ?? "All"}
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ]}
        />
      );
    case "select":
      return (
        <SelectFilter
          paramKey={key}
          placeholder={filter.placeholder}
          options={filter.options ?? []}
        />
      );
    default:
      return <TextFilter paramKey={key} placeholder={filter.placeholder} />;
  }
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  pagination,
  loading,
  toolbar,
  emptyState,
  rowKey,
  className,
}: DataTableProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSort = searchParams.get("sortBy") ?? "";
  const currentOrder = searchParams.get("sortOrder") ?? "desc";
  const currentLimit = searchParams.get("limit") ?? "10";
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  const setParam = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) =>
        v !== null ? p.set(k, v) : p.delete(k)
      );
      return p;
    });
  };

  const handleSort = (key: string) => {
    const isActive = currentSort === key;
    setParam({
      sortBy: key,
      sortOrder: isActive && currentOrder === "desc" ? "asc" : "desc",
      page: "1",
    });
  };

  // Detect active filters
  const hasFilters = columns.some((col) => {
    if (!col.filter) return false;
    const key = col.filter.paramKey ?? col.key;
    if (col.filter.type === "date-range") {
      return searchParams.get(`${key}_from`) || searchParams.get(`${key}_to`);
    }
    return !!searchParams.get(key);
  });

  const clearAll = () => {
    const keys = columns
      .filter((c) => c.filter)
      .flatMap((c) => {
        const key = c.filter!.paramKey ?? c.key;
        return c.filter!.type === "date-range"
          ? [`${key}_from`, `${key}_to`]
          : [key];
      });
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      keys.forEach((k) => p.delete(k));
      p.delete("search");
      p.set("page", "1");
      return p;
    });
  };

  const skeletonCount = Math.min(parseInt(currentLimit, 10), 10);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Top toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-muted-foreground"
              onClick={clearAll}
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>
        {toolbar && <div className="flex items-center gap-2 ml-auto">{toolbar}</div>}
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {/* ── Column header row ── */}
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "py-3 text-xs font-semibold text-foreground/80 uppercase tracking-wide",
                    col.headerClassName
                  )}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        "flex items-center gap-0.5 hover:text-primary transition-colors font-semibold",
                        currentSort === col.key && "text-primary"
                      )}
                    >
                      {col.header}
                      <SortIcon col={col.key} currentSort={currentSort} currentOrder={currentOrder} />
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>

            {/* ── Filter row (only if any column has a filter) ── */}
            {columns.some((c) => c.filter) && (
              <TableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                {columns.map((col) => (
                  <TableHead key={`f-${col.key}`} className="py-1.5 px-3">
                    {col.filter && (
                      <FilterCell filter={col.filter} columnKey={col.key} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            )}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3">
                      <Skeleton className="h-4 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-20 text-center text-muted-foreground"
                >
                  {emptyState ?? (
                    <div className="flex flex-col items-center gap-3">
                      <PackageSearch className="h-10 w-10 opacity-25" />
                      <p className="text-sm">No results found</p>
                      {hasFilters && (
                        <Button variant="link" size="sm" onClick={clearAll}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={rowKey ? rowKey(row) : idx}
                  className="hover:bg-muted/20 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("py-2.5 align-middle", col.className)}
                    >
                      {col.cell
                        ? col.cell(row)
                        : ((row as unknown as Record<string, unknown>)[col.key] as React.ReactNode) ?? "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ── */}
      {pagination && (
        <div className="flex items-center justify-between flex-wrap gap-3 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs">Rows per page</span>
            <Select
              value={currentLimit}
              onValueChange={(v) => setParam({ limit: v, page: "1" })}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs">
              {pagination.total === 0
                ? "0"
                : `${(currentPage - 1) * parseInt(currentLimit, 10) + 1}–${Math.min(
                    currentPage * parseInt(currentLimit, 10),
                    pagination.total
                  )}`}{" "}
              of {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage <= 1}
              onClick={() => setParam({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {getPageNumbers(currentPage, pagination.totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setParam({ page: String(p) })}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setParam({ page: String(currentPage + 1) })}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
