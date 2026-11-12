import React, { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowSelectedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { Download, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataGridProps<TData = any> {
  rowData: TData[] | null | undefined;
  columnDefs: ColDef<TData>[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableExport?: boolean;
  exportFileName?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  height?: string | number;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRowSelect?: (selectedData: TData | null) => void;
  onGridReady?: (params: GridReadyEvent<TData>) => void;
  actions?: React.ReactNode;
}

export function DataGrid<TData = any>({
  rowData,
  columnDefs,
  title,
  subtitle,
  searchPlaceholder = "Quick search in table...",
  enableSearch = true,
  enableExport = true,
  exportFileName = "trusttopay-export.csv",
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  height = "520px",
  className,
  isLoading = false,
  error = null,
  onRetry,
  onRowSelect,
  onGridReady: onGridReadyProp,
  actions,
}: DataGridProps<TData>) {
  const gridRef = useRef<AgGridReact<TData>>(null);
  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedRowCount, setSelectedRowCount] = useState(0);

  const defaultColDef = useMemo<ColDef<TData>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: false,
      minWidth: 100,
    }),
    [],
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent<TData>) => {
      setGridApi(params.api);
      if (onGridReadyProp) {
        onGridReadyProp(params);
      }
    },
    [onGridReadyProp],
  );

  const handleExportCsv = useCallback(() => {
    if (!gridApi) return;
    gridApi.exportDataAsCsv({
      fileName: exportFileName,
    });
  }, [gridApi, exportFileName]);

  const handleFitColumns = useCallback(() => {
    if (!gridApi) return;
    gridApi.autoSizeAllColumns();
  }, [gridApi]);

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<TData>) => {
      const selected = event.api.getSelectedRows();
      setSelectedRowCount(selected.length);
      if (onRowSelect) {
        onRowSelect(selected.length > 0 ? selected[0] : null);
      }
    },
    [onRowSelect],
  );

  return (
    <div className={cn("flex flex-col rounded-xl border border-[#E5E1D7] bg-[#FFFEFA] shadow-xs", className)}>
      {/* Grid Toolbar Header */}
      <div className="flex flex-col gap-3 border-b border-[#E5E1D7] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5 min-w-0">
          {title ? (
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#202722]">{title}</h3>
              {rowData ? (
                <span className="shrink-0 whitespace-nowrap inline-flex items-center h-5 rounded-full bg-[#F7F5EF] px-2 text-[11px] font-medium leading-none text-[#4B554F] border border-[#E5E1D7]">
                  {rowData.length} {rowData.length === 1 ? "record" : "records"}
                </span>
              ) : null}
            </div>
          ) : null}
          {subtitle ? <p className="text-xs text-[#69736D] truncate">{subtitle}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {enableSearch ? (
            <div className="relative min-w-[180px] flex-1 sm:w-60 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#69736D]" />
              <input
                type="text"
                value={quickFilterText}
                onChange={(e) => setQuickFilterText(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-[#E5E1D7] bg-white py-1.5 pl-8 pr-7 text-xs text-[#202722] placeholder:text-[#8E9790] focus:border-[#365FEA] focus:outline-hidden focus:ring-1 focus:ring-[#365FEA]"
              />
              {quickFilterText ? (
                <button
                  type="button"
                  onClick={() => setQuickFilterText("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#69736D] hover:text-[#202722]"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFitColumns}
            title="Auto-fit column widths"
            className="h-8 text-xs shrink-0"
          >
            Auto-fit
          </Button>

          {enableExport ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              title="Export grid data to CSV file"
              className="h-8 gap-1.5 text-xs text-[#202722] shrink-0"
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
          ) : null}

          {actions}
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        className="ag-theme-quartz w-full"
        style={{
          height: typeof height === "number" ? `${height}px` : height,
        }}
      >
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-medium text-[#E5484D]">Failed to load table data</p>
            <p className="max-w-md text-xs text-[#69736D]">{error}</p>
            {onRetry ? (
              <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-2 text-xs">
                <RefreshCw className="mr-1.5 size-3.5" /> Retry
              </Button>
            ) : null}
          </div>
        ) : isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-[#69736D]">
            <RefreshCw className="size-5 animate-spin text-[#365FEA]" />
            <p className="text-xs font-medium">Loading operational records…</p>
          </div>
        ) : (
          <AgGridReact<TData>
            ref={gridRef}
            rowData={rowData ?? []}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            rowSelection="single"
            rowHeight={48}
            headerHeight={44}
            pagination={true}
            paginationPageSize={pageSize}
            paginationPageSizeSelector={pageSizeOptions}
            animateRows={true}
            enableCellTextSelection={true}
            suppressCellFocus={false}
            onGridReady={handleGridReady}
            onSelectionChanged={handleSelectionChanged}
            overlayNoRowsTemplate={`<div class="p-6 text-center text-xs text-[#69736D] font-medium">No matching operational records found.</div>`}
          />
        )}
      </div>

      {/* Grid Footer Bar */}
      <div className="flex items-center justify-between border-t border-[#E5E1D7] bg-[#FAF8F2] px-4 py-2 text-[11px] text-[#69736D]">
        <div className="flex items-center gap-2">
          <span>AG Grid Community 32.3.9</span>
          <span>•</span>
          <span>{selectedRowCount > 0 ? `${selectedRowCount} row selected` : "Select row to view details"}</span>
        </div>
        <div>
          <span>Multi-column sort: hold <kbd className="rounded border border-[#E5E1D7] bg-white px-1 py-0.5 font-mono text-[10px]">Shift</kbd> while clicking headers</span>
        </div>
      </div>
    </div>
  );
}
