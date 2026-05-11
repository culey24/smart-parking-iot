import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, LogOut, Camera, User, Maximize2, X, CreditCard, Clock } from "lucide-react";
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
import { MANUAL_OPEN_REASONS, type ManualOpenReason } from "@/types/gate";
import {
  GATEWAY_DISPLAY_ITEMS,
  type GatewayDisplayItem,
} from "@/data/gatewayDisplayData";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function GatewayDisplayPanel({
  item,
  onOpenBarrier,
  onCloseBarrier,
  compact = false,
}: {
  item: GatewayDisplayItem;
  onOpenBarrier: () => void;
  onCloseBarrier: () => void;
  compact?: boolean;
}) {
  const isEntry = item.direction === "entry";

  if (compact) {
    return (
      <Card className="overflow-hidden border transition-all hover:border-[#003087]/50">
        <CardHeader className="space-y-1 border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              {isEntry ? (
                <LogIn className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <LogOut className="h-3.5 w-3.5 text-amber-600" />
              )}
              {item.gateLabel}
            </CardTitle>
            <Badge
              variant={item.barrierStatus === "open" ? "success" : "danger"}
              className="shrink-0 text-xs"
            >
              {item.barrierStatus === "open" ? "Open" : "Closed"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{item.licensePlate}</p>
        </CardHeader>
        <CardContent className="p-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full border-[#003087]/50 text-[#003087] hover:bg-[#003087]/10"
            onClick={onOpenBarrier}
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Expand view
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExit = item.direction === "exit";
  const entrySession = item.entrySession;

  return (
    <Card className="overflow-hidden border">
      <CardHeader className="space-y-2 border-b bg-muted/50 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {isEntry ? (
              <LogIn className="h-4 w-4 text-green-600" />
            ) : (
              <LogOut className="h-4 w-4 text-amber-600" />
            )}
            {item.gateLabel}
          </CardTitle>
          <Badge
            variant={item.barrierStatus === "open" ? "success" : "danger"}
            className="shrink-0"
          >
            {item.barrierStatus === "open" ? "Open" : "Closed"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatTime(item.timestamp)} •{" "}
          {isEntry ? "Entry" : `Exit${entrySession ? " (card scanned)" : ""}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Cổng ra: 2 cột – Trái: phiên vào | Phải: biển số + mặt xe ra */}
        {isExit && entrySession ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bên trái: Thông tin phiên lúc xe vào – ảnh biển số + ảnh khuôn mặt */}
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <CreditCard className="h-4 w-4" />
                Entry session
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Camera className="h-3.5 w-3.5" />
                    License plate (entry)
                  </div>
                  <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                    <img
                      src={entrySession.licensePlateImageUrl}
                      alt="License plate (entry)"
                      className="h-24 w-full object-cover object-top sm:h-28"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        el.nextElementSibling?.classList.remove("hidden");
                        el.nextElementSibling?.classList.add("flex");
                      }}
                    />
                    <div className="hidden h-24 w-full items-center justify-center bg-muted sm:h-28">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="border-t bg-muted/80 px-3 py-2">
                      <p className="font-mono text-lg font-bold tracking-wider">
                        {entrySession.licensePlate}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    Driver face (entry)
                  </div>
                  <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                    <img
                      src={entrySession.driverFaceImageUrl}
                      alt="Driver face (entry)"
                      className="h-36 w-36 object-cover object-top"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        el.nextElementSibling?.classList.remove("hidden");
                        el.nextElementSibling?.classList.add("flex");
                      }}
                    />
                    <div className="hidden h-36 w-36 items-center justify-center bg-muted">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry time</span>
                  <span className="font-mono">{formatTime(entrySession.entryTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry gate</span>
                  <span>{entrySession.entryGateLabel}</span>
                </div>
                {entrySession.durationMinutes != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {entrySession.durationMinutes} min
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bên phải: Biển số + mặt xe ra */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Camera className="h-3.5 w-3.5" />
                  License plate (exit)
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                  <img
                    src={item.licensePlateImageUrl}
                    alt="License plate"
                    className="h-24 w-full object-cover object-top sm:h-28"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      el.nextElementSibling?.classList.remove("hidden");
                      el.nextElementSibling?.classList.add("flex");
                    }}
                  />
                  <div className="hidden h-24 w-full items-center justify-center bg-muted sm:h-28">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="border-t bg-muted/80 px-3 py-2">
                    <p className="font-mono text-lg font-bold tracking-wider">
                      {item.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Driver face
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                  <img
                    src={item.driverFaceImageUrl}
                    alt="Driver face"
                    className="h-36 w-36 object-cover object-top"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      el.nextElementSibling?.classList.remove("hidden");
                      el.nextElementSibling?.classList.add("flex");
                    }}
                  />
                  <div className="hidden h-36 w-36 items-center justify-center bg-muted">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isExit ? (
          /* Cổng ra chưa quét thẻ: hiển thị placeholder */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-amber-300 bg-amber-50/80 p-8">
              <CreditCard className="mb-2 h-12 w-12 text-amber-600" />
              <p className="text-center text-sm text-amber-700">Waiting for card scan...</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">Entry session info will appear here</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Camera className="h-3.5 w-3.5" />
                  License plate (exit)
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                  <img
                    src={item.licensePlateImageUrl}
                    alt="License plate"
                    className="h-24 w-full object-cover object-top sm:h-28"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      el.nextElementSibling?.classList.remove("hidden");
                      el.nextElementSibling?.classList.add("flex");
                    }}
                  />
                  <div className="hidden h-24 w-full items-center justify-center bg-muted sm:h-28">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="border-t bg-muted/80 px-3 py-2">
                    <p className="font-mono text-lg font-bold tracking-wider">
                      {item.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Driver face
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                  <img
                    src={item.driverFaceImageUrl}
                    alt="Driver face"
                    className="h-36 w-36 object-cover object-top"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      el.nextElementSibling?.classList.remove("hidden");
                      el.nextElementSibling?.classList.add("flex");
                    }}
                  />
                  <div className="hidden h-36 w-36 items-center justify-center bg-muted">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Cổng vào: Biển số + Khuôn mặt */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Camera className="h-3.5 w-3.5" />
                License plate
              </div>
              <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                <img
                  src={item.licensePlateImageUrl}
                  alt="License plate"
                  className="h-24 w-full object-cover object-top sm:h-28"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    el.nextElementSibling?.classList.remove("hidden");
                    el.nextElementSibling?.classList.add("flex");
                  }}
                />
                <div className="hidden h-24 w-full items-center justify-center bg-muted sm:h-28">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="border-t bg-muted/80 px-3 py-2">
                  <p className="font-mono text-lg font-bold tracking-wider">
                    {item.licensePlate}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Face
              </div>
              <div className="overflow-hidden rounded-lg border bg-muted/50 shadow-inner">
                <img
                  src={item.driverFaceImageUrl}
                  alt="Driver face"
                  className="h-36 w-36 object-cover object-top"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    el.nextElementSibling?.classList.remove("hidden");
                    el.nextElementSibling?.classList.add("flex");
                  }}
                />
                <div className="hidden h-36 w-36 items-center justify-center bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nút điều khiển barrier */}
        <div className="flex gap-2 border-t pt-4">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={onOpenBarrier}
          >
            Open barrier
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={onCloseBarrier}
          >
            Close barrier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function BarrierControlPage() {
  const [displayItems, setDisplayItems] = useState<GatewayDisplayItem[]>([]);
  const [expandedGateId, setExpandedGateId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    gateId: string;
    action: "open" | "close";
  } | null>(null);
  const [selectedReason, setSelectedReason] = useState<ManualOpenReason | null>(
    null
  );

  useEffect(() => {
    setDisplayItems(GATEWAY_DISPLAY_ITEMS);
  }, []);

  useEffect(() => {
    if (!expandedGateId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedGateId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedGateId]);

  function handleBarrierAction(gateId: string, action: "open" | "close") {
    if (action === "close") {
      setDisplayItems((prev) =>
        prev.map((d) =>
          d.gateId === gateId ? { ...d, barrierStatus: "closed" } : d
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
    setDisplayItems((prev) =>
      prev.map((d) =>
        d.gateId === pendingAction.gateId ? { ...d, barrierStatus: "open" } : d
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
              Gateway Display – Barrier Control
            </h1>
            <p className="text-sm text-muted-foreground">
              One gateway per display. Click &quot;Expand view&quot; to see details and control barrier.
            </p>
          </div>
        </div>
      </div>

      {/* Mỗi cổng = 1 màn hình gateway. Chọn cổng để phóng to. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayItems.map((item) => (
          <GatewayDisplayPanel
            key={item.gateId}
            item={item}
            compact
            onOpenBarrier={() => setExpandedGateId(item.gateId)}
            onCloseBarrier={() => {}}
          />
        ))}
      </div>

      {/* Fullscreen overlay khi phóng to 1 cổng */}
      {expandedGateId && (() => {
        const item = displayItems.find((d) => d.gateId === expandedGateId);
        if (!item) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-background"
            role="dialog"
            aria-label="Gateway display expanded"
          >
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/50 px-4 py-3">
              <h2 className="text-lg font-semibold">
                {item.gateLabel} – Control display
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpandedGateId(null)}
                title="Minimize (Esc)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto p-8">
              <div className="w-full max-w-3xl">
                <GatewayDisplayPanel
                  item={item}
                  onOpenBarrier={() => handleBarrierAction(item.gateId, "open")}
                  onCloseBarrier={() => handleBarrierAction(item.gateId, "close")}
                />
              </div>
            </div>
          </div>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual barrier open – Select reason</DialogTitle>
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
