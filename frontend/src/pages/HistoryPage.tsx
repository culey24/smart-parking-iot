import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getParkingHistory } from "@/services/parkingService";
import { getBillingHistory } from "@/services/billingService";
import type { ParkingRecord, BillingRecord } from "@/types/api";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function HistoryPage() {
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [parkingHistory, setParkingHistory] = useState<ParkingRecord[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);

  useEffect(() => {
    getParkingHistory().then(setParkingHistory);
    getBillingHistory().then(setBillingHistory);
  }, []);

  const handleReportIssue = (id: string) => {
    setReportingId(id);
    // TODO: UC 3.6 - Open modal/form for wrong fee or billing error
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#003087]">History</h1>

      <Tabs defaultValue="parking" className="w-full">
        <TabsList>
          <TabsTrigger value="parking">Parking History</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="parking">
          <p className="mb-4 text-sm text-muted-foreground">
            Parking sessions with fee per session
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead className="text-right">Fee (VND)</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parkingHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDateTime(row.entryTime)}</TableCell>
                    <TableCell>
                      {row.exitTime
                        ? formatDateTime(row.exitTime)
                        : "—"}
                    </TableCell>
                    <TableCell>{row.licensePlate}</TableCell>
                    <TableCell className="text-right">
                      {row.fee > 0 ? row.fee.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs hover:bg-[#003087]/10 hover:text-[#003087]"
                        onClick={() => handleReportIssue(row.id)}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Report issue
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {reportingId && (
            <p className="mt-2 text-sm text-muted-foreground">
              Report submitted for session {reportingId}. (UC 3.6 – billing error
              flow)
            </p>
          )}
        </TabsContent>

        <TabsContent value="billing">
          <p className="mb-4 text-sm text-muted-foreground">
            Payment history by billing cycle
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Paid At</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount (VND)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {formatDate(row.cycleStart)} – {formatDate(row.cycleEnd)}
                    </TableCell>
                    <TableCell>{formatDateTime(row.paidAt)}</TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell className="text-right">
                      {row.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize">{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
