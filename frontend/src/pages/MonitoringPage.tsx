import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  Camera,
  Signpost,
  ShieldAlert,
  Layers,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { getMonitoringData } from "@/services/monitoringService";
import type {
  Slot,
  InfrastructureDevice,
  InfrastructureAlert,
} from "@/types/monitoring";

const GRID_COLS = 8;
const SLOT_ROWS = 5;

function formatAlertTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SensorDot({ slot }: { slot: Slot }) {
  const isError = slot.deviceStatus === "error";
  const isEmpty = slot.status === "empty";

  const dotColor = isError
    ? "bg-red-500"
    : isEmpty
      ? "bg-green-500"
      : "bg-red-500";

  return (
    <div
      className={`h-2 w-2 shrink-0 rounded-full transition-all duration-200 ${
        isError ? "animate-pulse ring-2 ring-red-500 ring-offset-1" : ""
      } ${dotColor}`}
      title={`${slot.id}: ${slot.status}${isError ? " (Sensor error)" : ""}`}
    />
  );
}

function DeviceIcon({
  device,
  size = 24,
}: {
  device: InfrastructureDevice;
  size?: number;
}) {
  const isError = device.status === "error";
  const Icon =
    device.type === "gateway"
      ? Radio
      : device.type === "camera"
        ? Camera
        : Signpost;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg p-1 transition-all duration-200 ${
        isError
          ? "animate-pulse border-2 border-red-500 bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          : "border border-[#003087]/30 bg-[#003087]/10"
      }`}
      title={`${device.label}: ${device.status}`}
    >
      <Icon
        size={size}
        className={isError ? "text-red-600" : "text-[#003087]"}
      />
      <span className="mt-0.5 truncate text-[10px] font-medium max-w-[60px]">
        {device.label.split(" ")[0]}
      </span>
    </div>
  );
}

export function MonitoringPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [devices, setDevices] = useState<InfrastructureDevice[]>([]);
  const [alerts, setAlerts] = useState<InfrastructureAlert[]>([]);

  const [showSensors, setShowSensors] = useState(true);
  const [showGateways, setShowGateways] = useState(true);
  const [showSignage, setShowSignage] = useState(true);
  const [showCameras, setShowCameras] = useState(true);

  useEffect(() => {
    getMonitoringData().then((data) => {
      setSlots(data.slots);
      setDevices(data.devices);
      setAlerts(data.alerts);
    });
  }, []);

  const slotGrid = Array.from({ length: SLOT_ROWS }, (_, r) =>
    slots.filter((s) => s.row === r)
  );
  const topDevices = devices.filter((d) => d.row === 0);
  const bottomDevices = devices.filter((d) => d.row >= 5);

  const gatewayCount = devices.filter((d) => d.type === "gateway").length;
  const signageCount = devices.filter((d) => d.type === "signage").length;
  const cameraCount = devices.filter((d) => d.type === "camera").length;

  const filteredTopDevices = topDevices.filter((d) => {
    if (d.type === "gateway") return showGateways;
    if (d.type === "signage") return showSignage;
    if (d.type === "camera") return showCameras;
    return true;
  });

  const filteredBottomDevices = bottomDevices.filter((d) => {
    if (d.type === "gateway") return showGateways;
    if (d.type === "signage") return showSignage;
    if (d.type === "camera") return showCameras;
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#003087]">
            Live Parking Lot Monitoring
          </h1>
          <div className="flex gap-3">
            <Button asChild className="bg-[#003087] hover:bg-[#003087]/90">
              <Link to="/barrier-control">Barrier Control</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#003087] text-[#003087] hover:bg-[#003087]/10"
            >
              <Link to="/card-processing">Card Processing</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col gap-2 overflow-auto rounded-xl border bg-muted/30 p-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-6 top-6 z-10 gap-2 border-[#003087]/30 bg-background/95 shadow-md backdrop-blur hover:bg-[#003087]/5"
              >
                <Layers className="h-4 w-4" />
                Layers
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="w-64">
              <div className="space-y-4">
                <h3 className="font-semibold text-[#003087]">Layer Control</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      Sensors ({slots.length})
                    </label>
                    <Switch
                      checked={showSensors}
                      onCheckedChange={setShowSensors}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Radio className="h-4 w-4 text-muted-foreground" />
                      Gateways ({gatewayCount})
                    </label>
                    <Switch
                      checked={showGateways}
                      onCheckedChange={setShowGateways}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Signpost className="h-4 w-4 text-muted-foreground" />
                      Signage ({signageCount})
                    </label>
                    <Switch
                      checked={showSignage}
                      onCheckedChange={setShowSignage}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      Cameras ({cameraCount})
                    </label>
                    <Switch
                      checked={showCameras}
                      onCheckedChange={setShowCameras}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Empty
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Error
            </span>
          </div>

          {(showGateways || showSignage || showCameras) && (
            <div className="flex flex-wrap justify-center gap-4 py-2 transition-opacity duration-200">
              {filteredTopDevices.map((dev) => (
                <DeviceIcon key={dev.id} device={dev} size={28} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            {showSensors ? (
              slotGrid.map((rowSlots, r) => (
                <div key={r} className="flex justify-center gap-1">
                  {Array.from({ length: GRID_COLS }, (_, col) => {
                    const slot = rowSlots.find((s) => s.col === col);
                    return (
                      <div
                        key={`${r}-${col}`}
                        className="flex h-4 w-4 items-center justify-center"
                      >
                        {slot ? (
                          <SensorDot slot={slot} />
                        ) : (
                          <div className="h-2 w-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
                Sensors layer is hidden
              </div>
            )}
          </div>

          {(showGateways || showSignage || showCameras) && (
            <div className="flex flex-wrap justify-center gap-4 py-2 transition-opacity duration-200">
              {filteredBottomDevices.map((dev) => (
                <DeviceIcon key={dev.id} device={dev} size={28} />
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="w-80 shrink-0 space-y-3 rounded-xl border bg-card p-4">
        <h2 className="flex items-center gap-2 font-semibold text-[#003087]">
          <ShieldAlert className="h-5 w-5" />
          Infrastructure Alerts
        </h2>
        <div className="space-y-2 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border-l-4 p-3 text-sm ${
                  alert.severity === "critical"
                    ? "border-red-500 bg-red-50"
                    : alert.severity === "error"
                      ? "border-amber-500 bg-amber-50"
                      : "border-amber-400 bg-amber-50/50"
                }`}
              >
                <p className="font-medium">{alert.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {alert.deviceId} • {formatAlertTime(alert.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
