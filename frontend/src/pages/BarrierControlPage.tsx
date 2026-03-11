import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MANUAL_OPEN_REASONS, type Gate, type ManualOpenReason } from "@/types/gate";
import gatesData from "@/data/gatesData.json";

export function BarrierControlPage() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    gateId: string;
    action: "open" | "close";
  } | null>(null);
  const [selectedReason, setSelectedReason] = useState<ManualOpenReason | null>(null);

  useEffect(() => {
    setGates(gatesData as Gate[]);
  }, []);

  function handleBarrierAction(gateId: string, action: "open" | "close") {
    if (action === "close") {
      setGates((prev) =>
        prev.map((g) =>
          g.id === gateId ? { ...g, barrierStatus: "closed" as const } : g
        )
      );
      return;
    }
    setPendingAction({ gateId, action });
    setSelectedReason(null);
    setDialogOpen(true);
  }

  function handleConfirmManualOpen() {
    if (!pendingAction || !selectedReason) return;
    setGates((prev) =>
      prev.map((g) =>
        g.id === pendingAction.gateId ? { ...g, barrierStatus: "open" as const } : g
      )
    );
    setDialogOpen(false);
    setPendingAction(null);
    setSelectedReason(null);
  }

  function handleCancelDialog() {
    setDialogOpen(false);
    setPendingAction(null);
    setSelectedReason(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/monitoring">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#003087]">
              Manual Gate Management
            </h1>
            <p className="text-sm text-muted-foreground">
              For emergency or system error handling
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gates.map((gate) => (
          <Card key={gate.id} className="border-[#003087]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{gate.label}</CardTitle>
              <Badge
                variant={gate.barrierStatus === "open" ? "success" : "danger"}
              >
                {gate.barrierStatus === "open" ? "Open" : "Closed"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleBarrierAction(gate.id, "open")}
                >
                  Open Barrier
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleBarrierAction(gate.id, "close")}
                >
                  Close Barrier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Open – Select Reason</DialogTitle>
            <DialogDescription>
              Please select the reason for manually opening the barrier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {MANUAL_OPEN_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`rounded-lg border p-3 text-left text-sm font-medium transition-colors ${
                  selectedReason === reason
                    ? "border-[#003087] bg-[#003087]/10 text-[#003087]"
                    : "border-input hover:bg-muted/50"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDialog}>
              Cancel
            </Button>
            <Button
              className="bg-[#003087] hover:bg-[#003087]/90"
              onClick={handleConfirmManualOpen}
              disabled={!selectedReason}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
