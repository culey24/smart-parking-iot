import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getReconciliationRequests,
  getSpmsData,
  getBkpayData,
  getRelatedSessions,
  updateRequestStatus,
} from "@/services/reconciliationService";
import type {
  ReconciliationRequest,
  SpmsData,
  BkpayData,
  RelatedSession,
  ReconciliationStatus,
} from "@/types/reconciliation";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: ReconciliationStatus }) {
  const config: Record<string, { variant: "secondary" | "success" | "outline" | "default"; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    confirmed: { variant: "success", label: "Confirmed" },
    refunded: { variant: "outline", label: "Refunded" },
    adjusted: { variant: "default", label: "Adjusted" },
  };
  const key = (status || "").toString().toLowerCase();
  const { variant, label } = config[key] ?? { variant: "secondary", label: status || "Unknown" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function FeeReconciliationPage() {
  const [requests, setRequests] = useState<ReconciliationRequest[]>([]);
  const [selected, setSelected] = useState<ReconciliationRequest | null>(null);
  const [spms, setSpms] = useState<SpmsData | null>(null);
  const [bkpay, setBkpay] = useState<BkpayData | null>(null);
  const [related, setRelated] = useState<RelatedSession[]>([]);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustNote, setAdjustNote] = useState("");

  useEffect(() => {
    getReconciliationRequests().then(setRequests);
  }, []);

  useEffect(() => {
    if (!selected) {
      setSpms(null);
      setBkpay(null);
      setRelated([]);
      return;
    }
    getSpmsData(selected.sessionId).then(setSpms);
    getBkpayData(selected.sessionId).then(setBkpay);
    getRelatedSessions(selected.userId).then(setRelated);
  }, [selected]);

  const refreshRequests = () => {
    getReconciliationRequests().then(setRequests);
  };

  const handleAction = async (
    status: ReconciliationStatus,
    note?: string
  ) => {
    if (!selected) return;
    await updateRequestStatus(selected.id, status, note);
    setSelected({ ...selected, status });
    refreshRequests();
    setAdjustOpen(false);
    setAdjustNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/pricing-policy">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#003087]">
              Fee Reconciliation
            </h1>
            <p className="text-sm text-muted-foreground">
              Resolve report issues – SPMS vs BKPay comparison
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#003087]">Report Issues</CardTitle>
            <p className="text-xs text-muted-foreground">
              UC 3.6 – wrong fee or payment errors
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending requests
                </p>
              ) : (
                requests.map((req, i) => (
                  <button
                    key={req.id || i}
                    type="button"
                    onClick={() => setSelected(req)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected?.id === req.id
                        ? "border-[#003087] bg-[#003087]/10"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{req.licensePlate}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {req.description}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(req.reportedAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selected ? (
            <>
              <Card className="border-[#003087]/20">
                <CardHeader>
                  <CardTitle className="text-[#003087]">
                    Reconciliation Data
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selected.userName} • {selected.licensePlate}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 font-semibold text-[#003087]">
                        SPMS System
                      </h3>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        {spms ? (
                          <dl className="space-y-2 text-sm">
                            <div>
                              <dt className="text-muted-foreground">
                                Entry time
                              </dt>
                              <dd>{formatDateTime(spms.entryTime)}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Exit time
                              </dt>
                              <dd>{formatDateTime(spms.exitTime)}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                License plate
                              </dt>
                              <dd>{spms.licensePlate}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Card ID
                              </dt>
                              <dd className="font-mono">{spms.cardId}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Calculated amount
                              </dt>
                              <dd className="font-semibold">
                                {spms.calculatedAmount.toLocaleString()} VND
                              </dd>
                            </div>
                          </dl>
                        ) : (
                          <p className="text-muted-foreground">
                            No SPMS data
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 font-semibold text-[#003087]">
                        BKPay
                      </h3>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        {bkpay ? (
                          <dl className="space-y-2 text-sm">
                            <div>
                              <dt className="text-muted-foreground">
                                Transaction ID
                              </dt>
                              <dd className="font-mono">
                                {bkpay.transactionId}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Transaction status
                              </dt>
                              <dd>{bkpay.transactionStatus}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Actual amount
                              </dt>
                              <dd className="font-semibold">
                                {bkpay.actualAmount.toLocaleString()} VND
                              </dd>
                            </div>
                          </dl>
                        ) : (
                          <p className="text-muted-foreground">
                            No BKPay data
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#003087]">
                    Related History (current cycle)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Parking sessions for incremental check
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Session</TableHead>
                          <TableHead>Entry</TableHead>
                          <TableHead>Exit</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead className="text-right">Fee (VND)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {related.map((s, i) => (
                          <TableRow
                            key={s.id || i}
                            className={
                              s.id === selected.sessionId
                                ? "bg-[#003087]/5"
                                : ""
                            }
                          >
                            <TableCell className="font-mono">{s.id}</TableCell>
                            <TableCell>{formatDateTime(s.entryTime)}</TableCell>
                            <TableCell>{formatDateTime(s.exitTime)}</TableCell>
                            <TableCell>{s.licensePlate}</TableCell>
                            <TableCell className="text-right">
                              {s.fee.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {selected.status === "pending" && (
                <Card className="border-[#003087]/20">
                  <CardHeader>
                    <CardTitle className="text-sm text-[#003087]">
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleAction("confirmed")}
                      className="gap-2 bg-[#003087] hover:bg-[#003087]/90"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm correct
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction("refunded")}
                      className="gap-2 border-[#003087]/30 text-[#003087] hover:bg-[#003087]/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Refund
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAdjustOpen(true)}
                      className="gap-2 border-[#003087]/30 text-[#003087] hover:bg-[#003087]/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Adjust fee
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p>Select a request to view reconciliation data</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="border-[#003087]/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#003087]">
              Adjust fee
            </DialogTitle>
            <DialogDescription>
              Add a note for this adjustment (e.g. corrected amount, reason).
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Note..."
            value={adjustNote}
            onChange={(e) => setAdjustNote(e.target.value)}
            className="mt-2"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustOpen(false)}
              className="border-[#003087]/30"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("adjusted", adjustNote)}
              className="bg-[#003087] hover:bg-[#003087]/90"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
