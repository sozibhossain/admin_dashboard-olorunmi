"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PaginationControls } from "@/components/common/pagination-controls";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteAlert, getAlerts, getApiMessage, sendAlert } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { formatDateTimeLabel } from "@/lib/utils";
import type { ChecklistItem } from "@/types/api";

const PAGE_LIMIT = 8;

export default function AlertManagementPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ChecklistItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const alertsQuery = useQuery({
    queryKey: QUERY_KEYS.alerts(page, search),
    queryFn: () => getAlerts({ page, limit: PAGE_LIMIT, search }),
  });

  const sendMutation = useMutation({
    mutationFn: sendAlert,
    onSuccess: (response) => {
      toast.success(response.message || "Alert sent successfully");
      setSendModalOpen(false);
      setSelectedAlert(null);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["user-details"] });
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to send alert"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: (response) => {
      toast.success(response.message || "Alert deleted successfully");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to delete alert"));
    },
  });

  const alerts = alertsQuery.data?.alerts ?? [];
  const pagination = alertsQuery.data?.pagination;
  const currentPage = pagination?.page ?? 1;
  const currentLimit = pagination?.limit ?? PAGE_LIMIT;
  const startResult = alerts.length ? (currentPage - 1) * currentLimit + 1 : 0;
  const endResult = (currentPage - 1) * currentLimit + alerts.length;

  return (
    <section className="space-y-6">
      <div className="w-full xl:max-w-[280px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9a9a9a]" />
          <Input
            placeholder="Search ....."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-12 rounded-[14px] border border-[#b9b9b9] bg-transparent pl-9"
          />
        </div>
      </div>

      <PageHeader title="Alert Management" subtitle="Alert Management" />

      {alertsQuery.isLoading ? (
        <TableSkeleton rows={PAGE_LIMIT} />
      ) : (
        <>
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="border-none">
                <TableHead>User Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-[#6f6f6f]">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert._id}>
                    <TableCell>{alert.user?.name ?? "Unknown"}</TableCell>
                    <TableCell>{alert.user?.userId ?? "-"}</TableCell>
                    <TableCell>
                      {alert.checkOutAt
                        ? formatDateTimeLabel(alert.checkOutAt)
                        : formatDateTimeLabel(alert.checkInAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="danger">Out of location Zone</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-9 rounded-lg bg-[#ffa800] px-3 text-white hover:bg-[#ea9800]"
                          disabled={alert.alertStatus === "sent"}
                          onClick={() => {
                            setSelectedAlert(alert);
                            setSendModalOpen(true);
                          }}
                        >
                          <AlertTriangle className="size-4" />
                          {alert.alertStatus === "sent" ? "Alert Sent" : "Send alert"}
                        </Button>

                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-9 rounded-full bg-[#ffd5dc] text-[#ff2b2b]"
                          onClick={() => setDeleteId(alert._id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#686868]">
              Showing {startResult} to {endResult} of {pagination?.total ?? alerts.length} results
            </p>
            <PaginationControls
              page={page}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Location Alert</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex size-24 items-center justify-center rounded-full bg-[#fff3de] text-[#ffa800]">
                <AlertTriangle className="size-10" />
              </div>
            </div>

            <DialogDescription className="text-center text-base text-[#2f2f2f]">
              This user is go out from his location zone alert him
            </DialogDescription>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#efefef] px-3 py-2">
                <p className="text-xs text-[#696969]">User Name</p>
                <p className="font-medium">{selectedAlert?.user?.name ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-[#efefef] px-3 py-2">
                <p className="text-xs text-[#696969]">User ID</p>
                <p className="font-medium">{selectedAlert?.user?.userId ?? "-"}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
            <Button
              variant="outline"
              className="min-w-[140px]"
              onClick={() => setSendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="min-w-[140px] bg-[#ffa800] hover:bg-[#ea9800]"
              disabled={sendMutation.isPending || !selectedAlert}
              onClick={() => {
                if (selectedAlert?._id) {
                  sendMutation.mutate(selectedAlert._id);
                }
              }}
            >
              <AlertTriangle className="size-4" />
              {sendMutation.isPending ? "Sending..." : "Send alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(value) => {
          if (!value) {
            setDeleteId(null);
          }
        }}
        title="Are you sure?"
        description="You want to delete this alert from Dashboard."
        confirmText="Delete"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
          }
        }}
        loading={deleteMutation.isPending}
      />
    </section>
  );
}
