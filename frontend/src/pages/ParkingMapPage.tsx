import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Layers,
  Navigation,
  Activity,
  Zap,
  Box,
  Monitor,
  Maximize,
  Minimize
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlacedDevice, CanvasTransform } from "@/types/layoutMapping";
import { CAMPUS_PARKING_ALPHA } from "@/data/parkingMapData";
import { calculateZoneOccupancy } from "@/utils/mapGeometry";
import { cn } from "@/lib/utils";

// Simulated real-time state for placed hardware
const MOCK_HARDWARE_STATES = [
  { id: "SEN-1", status: "OCCUPIED" },
  { id: "SEN-2", status: "AVAILABLE" },
  { id: "SEN-3", status: "OCCUPIED" },
];

export function ParkingMapPage() {
  const [showFlow, setShowFlow] = useState(false);
  const [mappedDevices, setMappedDevices] = useState<PlacedDevice[]>([]);
  const [transform, setTransform] = useState<CanvasTransform>({ scale: 0.8, offsetX: 0, offsetY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("parking_layout_mapping");
    if (saved) {
      try {
        setMappedDevices(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load layout", e);
      }
    }
  }, []);

  const zoneStats = useMemo(() => {
    return calculateZoneOccupancy(CAMPUS_PARKING_ALPHA, mappedDevices, MOCK_HARDWARE_STATES);
  }, [mappedDevices]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const viewBox = `0 0 ${CAMPUS_PARKING_ALPHA.dimensions.width} ${CAMPUS_PARKING_ALPHA.dimensions.height}`;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#003087] tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8" /> Facility Monitoring
          </h1>
          <p className="text-sm text-[#003087]/50 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
            {CAMPUS_PARKING_ALPHA.mapName} <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
           <Button variant="outline" size="sm" onClick={() => setShowFlow(!showFlow)} className={cn("rounded-xl font-bold gap-2", showFlow && "bg-emerald-500 text-white")}>
              <Navigation className="h-4 w-4" /> {showFlow ? "Routes Visible" : "Show Routes"}
           </Button>
           <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <Button variant="ghost" size="icon" onClick={() => setTransform(p => ({...p, scale: Math.max(p.scale-0.1, 0.2)}))} className="h-8 w-8"><Minimize className="h-3 w-3" /></Button>
              <span className="text-[10px] font-black w-8 text-center">{Math.round(transform.scale*100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setTransform(p => ({...p, scale: Math.min(p.scale+0.1, 5)}))} className="h-8 w-8"><Maximize className="h-3 w-3" /></Button>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Map Canvas */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-[#1e1e1e] relative min-h-[800px] flex items-center justify-center cursor-default"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}>
          
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
                 backgroundSize: '24px 24px',
                 transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`
               }} />

          <div
            className="relative bg-white shadow-2xl rounded-xl overflow-hidden select-none origin-center transition-transform duration-75"
            style={{ 
              width: CAMPUS_PARKING_ALPHA.dimensions.width, 
              height: CAMPUS_PARKING_ALPHA.dimensions.height,
              transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
              cursor: isPanning ? "grabbing" : "grab"
            }}
          >
            {/* Architecture Layer */}
            <svg viewBox={viewBox} className="w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#fff" />
              {CAMPUS_PARKING_ALPHA.zones.map((zone: any) => (
                <g key={zone.id}>
                  {zone.bounds && (
                    <rect x={zone.bounds.x} y={zone.bounds.y} width={zone.bounds.width} height={zone.bounds.height} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="4" />
                  )}
                  {zone.slots?.map((slot: any) => (
                    <rect key={slot.id} x={zone.bounds!.x + slot.relX} y={zone.bounds!.y + slot.relY} width={slot.w} height={slot.h} fill="white" stroke="#f1f5f9" strokeWidth="1" rx="2" />
                  ))}
                </g>
              ))}
              
              {/* User-Drawn Dynamic Zones */}
              {mappedDevices.filter(d => d.type === "zone").map(zone => (
                <polygon 
                  key={zone.id}
                  points={zone.points?.map(p => `${(p.x/100) * CAMPUS_PARKING_ALPHA.dimensions.width},${(p.y/100) * CAMPUS_PARKING_ALPHA.dimensions.height}`).join(' ')} 
                  fill="rgba(59, 130, 246, 0.05)" 
                  stroke="#3b82f6" 
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
              ))}
            </svg>

            {/* Traffic Flow Layer */}
            {showFlow && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                <defs>
                  <marker id="arrow-live" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
                {mappedDevices.map(device => 
                  device.connections?.map(targetId => {
                    const target = mappedDevices.find(d => d.id === targetId);
                    if (!target) return null;
                    const isSlot = target.type === "sensor";
                    const state = MOCK_HARDWARE_STATES.find(s => s.id === target.id);
                    return (
                      <line
                        key={`${device.id}-${targetId}`}
                        x1={`${device.x}%`} y1={`${device.y}%`}
                        x2={`${target.x}%`} y2={`${target.y}%`}
                        stroke={isSlot ? (state?.status === "OCCUPIED" ? "#ef4444" : "#22c55e") : "#3b82f6"}
                        strokeWidth={isSlot ? "2" : "4"}
                        strokeDasharray={isSlot ? "4 4" : ""}
                        markerEnd="url(#arrow-live)"
                      />
                    );
                  })
                )}
              </svg>
            )}

            {/* Hardware Layer */}
            {mappedDevices.filter(d => d.type !== "zone").map((d) => {
              const isSensor = d.type === "sensor";
              const isSignage = d.type === "signage";
              const state = MOCK_HARDWARE_STATES.find(s => s.id === d.id);
              
              return (
                <div
                  key={d.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                >
                   {isSensor ? (
                     <div className={cn(
                       "h-4 w-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors duration-500",
                       state?.status === "OCCUPIED" ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                     )}>
                        <Zap className="h-2 w-2 text-white" />
                     </div>
                   ) : isSignage ? (
                     <div className="bg-[#003087] text-white px-2 py-1 rounded-lg shadow-xl flex items-center gap-2 border border-white/10">
                        <Monitor className="h-3 w-3" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Live</span>
                     </div>
                   ) : (
                     <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <Box className="h-3 w-3 text-slate-400" />
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Intelligence Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-[#003087] text-white p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4" /> Zone Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {Object.entries(zoneStats).map(([id, stats]) => {
                if (stats.total === 0) return null;
                const percent = Math.round((stats.occupied / stats.total) * 100);
                return (
                  <div key={id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-[#003087] uppercase truncate max-w-[150px]">{stats.label}</p>
                      <p className="text-[10px] font-bold text-[#003087]/60">{stats.occupied}/{stats.total}</p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000", percent > 80 ? 'bg-red-500' : 'bg-emerald-500')} 
                           style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-[#003087] to-[#0047cc] text-white p-6">
             <div className="flex items-center gap-3 mb-4">
               <Zap className="h-5 w-5 text-emerald-400" />
               <h4 className="text-[10px] font-black uppercase tracking-widest">Real-Time Insights</h4>
             </div>
             <p className="text-[11px] font-bold leading-relaxed opacity-90">
               Occupancy is dynamically calculated using a **Ray-Casting algorithm** for polygonal hit-testing across all architectural and dynamic zones.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
