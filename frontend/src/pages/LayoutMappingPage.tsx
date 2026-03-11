import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Gauge, Radio, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlacedDevice, MappedDeviceType } from "@/types/layoutMapping";

const DEVICE_PALETTE: { type: MappedDeviceType; label: string; icon: typeof Gauge }[] = [
  { type: "sensor", label: "Sensor", icon: Gauge },
  { type: "gateway", label: "Gateway", icon: Radio },
];

let nextId = 1;

export function LayoutMappingPage() {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const accept = file.type.startsWith("image/") || file.name.endsWith(".svg");
    if (!accept) return;
    const url = URL.createObjectURL(file);
    setMapUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  const handleDropFile = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const accept =
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".svg");
      if (!accept) return;
      const url = URL.createObjectURL(file);
      setMapUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDeviceDragStart = useCallback(
    (e: React.DragEvent, type: MappedDeviceType) => {
      e.dataTransfer.setData("application/device-type", type);
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleMapDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/device-type") as
        | MappedDeviceType
        | "";
      if (!type || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const id = `D${nextId++}`;
      setPlacedDevices((prev) => [
        ...prev,
        { id, type, x, y, label: `${type === "sensor" ? "Sensor" : "Gateway"} ${id}` },
      ]);
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin-dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#003087]">
              Layout Mapping
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload a map and drag device icons to real-world positions
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Device Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEVICE_PALETTE.map(({ type, label, icon: Icon }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => handleDeviceDragStart(e, type)}
                className="flex cursor-grab items-center gap-3 rounded-lg border border-[#003087]/30 bg-[#003087]/5 p-3 transition-colors hover:bg-[#003087]/10 active:cursor-grabbing"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#003087]/20">
                  <Icon className="h-5 w-5 text-[#003087]" />
                </div>
                <span className="font-medium text-sm">{label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Map Canvas</CardTitle>
            <p className="text-xs text-muted-foreground">
              Drop an image or SVG file, then drag devices from the palette onto the map
            </p>
          </CardHeader>
          <CardContent>
            <div
              ref={mapRef}
              onDrop={handleMapDrop}
              onDragOver={handleDragOver}
              className={`relative min-h-[400px] rounded-lg border-2 border-dashed ${
                mapUrl ? "border-[#003087]/30" : "border-muted-foreground/30"
              } bg-muted/20`}
            >
              {!mapUrl ? (
                <label
                  onDrop={handleDropFile}
                  onDragOver={handleDragOver}
                  className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center gap-4 p-8 transition-colors hover:bg-muted/30"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <span className="text-center text-sm text-muted-foreground">
                    Drop map file here or click to browse
                  </span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <>
                  <div className="absolute right-2 top-2 z-10">
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Change map</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*,.svg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <img
                    src={mapUrl}
                    alt="Parking map"
                    className="h-full w-full object-contain"
                    style={{ maxHeight: 500 }}
                  />
                  {placedDevices.map((d) => {
                    const Icon =
                      d.type === "sensor" ? Gauge : Radio;
                    return (
                      <div
                        key={d.id}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${d.x}%`,
                          top: `${d.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#003087] bg-[#003087]/20 shadow-md">
                          <Icon className="h-5 w-5 text-[#003087]" />
                        </div>
                        <span className="mt-1 max-w-[80px] truncate text-xs font-medium">
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
