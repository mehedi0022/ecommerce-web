import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  /** Unique key matching a property of T or custom identifier */
  key: string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
  /** Optional custom cell renderer */
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  emptyMessage?: ReactNode;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
  skeletonRowCount?: number;
  onRowClick?: (row: T) => void;
  className?: string;
  containerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No records found.",
  emptyIcon,
  isLoading = false,
  skeletonRowCount = 5,
  onRowClick,
  className,
  containerClassName,
  rowClassName,
  stickyHeader = false,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "relative w-full overflow-auto bg-card text-card-foreground",
        containerClassName,
      )}
    >
      <Table className={cn("w-full caption-bottom text-sm", className)}>
        <TableHeader
          className={cn(
            "bg-muted/30 border-b border-border/60",
            stickyHeader && "sticky top-0 z-10 backdrop-blur-sm",
          )}
        >
          <TableRow className="hover:bg-transparent border-b-border/60">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  "h-11 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.headerClassName,
                  column.className,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="[&_tr:last-child]:border-0">
          {isLoading ? (
            Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
              <TableRow
                key={`skeleton-row-${rowIndex}`}
                className="border-b border-border/40 hover:bg-transparent"
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={`skeleton-col-${colIndex}`}
                    className={cn("p-4 align-middle", column.className)}
                  >
                    <Skeleton className="h-5 w-full rounded-md opacity-70" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-48 text-center align-middle"
              >
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-muted-foreground">
                  {emptyIcon && (
                    <div className="rounded-full bg-muted/60 p-3 text-muted-foreground/80 mb-1">
                      {emptyIcon}
                    </div>
                  )}
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => {
              const rowKey = getRowKey(row, rowIndex);
              const isClickable = Boolean(onRowClick);

              const computedRowClass =
                typeof rowClassName === "function"
                  ? rowClassName(row, rowIndex)
                  : rowClassName;

              return (
                <TableRow
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border/40 transition-colors duration-150 hover:bg-muted/30",
                    isClickable && "cursor-pointer active:bg-muted/50",
                    computedRowClass,
                  )}
                >
                  {columns.map((column) => {
                    const value = (row as Record<string, unknown>)[column.key];
                    return (
                      <TableCell
                        key={String(column.key)}
                        className={cn(
                          "px-4 py-3.5 align-middle text-sm text-foreground/90",
                          column.align === "right" && "text-right",
                          column.align === "center" && "text-center",
                          column.className,
                        )}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : (value as ReactNode)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
