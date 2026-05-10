import { useState } from "react";
import { 
  Car, 
  MapPin, 
  Info, 
  TrendingUp, 
  Activity,
  Layers,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParkingSlot {
  id: string;
  number: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  type: "CAR" | "MOTORBIKE" | "EV";
  x: number;
  y: number;
  rotation?: number;
}

const MOCK_SLOTS: ParkingSlot[] = [
  // Top Row
  { id: "1", number: "101", status: "OCCUPIED", type: "CAR", x: 100, y: 100 },
  { id: "2", number: "102", status: "AVAILABLE", type: "CAR", x: 160, y: 100 },
  { id: "3", number: "103", status: "OCCUPIED", type: "CAR", x: 220, y: 100 },
  { id: "4", number: "104", status: "AVAILABLE", type: "EV", x: 280, y: 100 },
  { id: "5", number: "105", status: "RESERVED", type: "CAR", x: 340, y: 100 },
  
  // Middle Row A
  { id: "6", number: "201", status: "AVAILABLE", type: "CAR", x: 100, y: 220 },
  { id: "7", number: "202", status: "OCCUPIED", type: "CAR", x: 160, y: 220 },
  { id: "8", number: "203", status: "AVAILABLE", type: "MOTORBIKE", x: 220, y: 220 },
  { id: "9", number: "204", status: "AVAILABLE", type: "MOTORBIKE", x: 250, y: 220 },
  { id: "10", number: "205", status: "OCCUPIED", type: "CAR", x: 310, y: 220 },

  // Middle Row B
  { id: "11", number: "206", status: "AVAILABLE", type: "CAR", x: 100, y: 300 },
  { id: "12", number: "207", status: "AVAILABLE", type: "CAR", x: 160, y: 300 },
  { id: "13", number: "208", status: "OCCUPIED", type: "CAR", x: 220, y: 300 },
  { id: "14", number: "209", status: "AVAILABLE", type: "CAR", x: 280, y: 300 },
  { id: "15", number: "210", status: "OCCUPIED", type: "CAR", x: 340, y: 300 },

  // Bottom Row
  { id: "16", number: "301", status: "OCCUPIED", type: "CAR", x: 100, y: 420 },
  { id: "17", number: "302", status: "AVAILABLE", type: "CAR", x: 160, y: 420 },
  { id: "18", number: "303", status: "AVAILABLE", type: "EV", x: 220, y: 420 },
  { id: "19", number: "304", status: "OCCUPIED", type: "CAR", x: 280, y: 420 },
  { id: "20", number: "305", status: "AVAILABLE", type: "CAR", x: 340, y: 420 },
];

export function ParkingMapPage() {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const total = MOCK_SLOTS.length;
  const available = MOCK_SLOTS.filter(s => s.status === "AVAILABLE").length;
  const occupied = MOCK_SLOTS.filter(s => s.status === "OCCUPIED").length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#003087] tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-[#003087]" />
            Layout Mapping & Status
          </h1>
          <p className="text-sm text-[#003087]/50 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
            Real-time Digital Twin <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Card className="bg-white border-[#003087]/10 shadow-sm px-6 py-3 flex items-center gap-4 rounded-2xl">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter">Available</p>
              <p className="text-xl font-black text-[#003087]">{available}</p>
            </div>
          </Card>
          <Card className="bg-white border-[#003087]/10 shadow-sm px-6 py-3 flex items-center gap-4 rounded-2xl">
            <div className="p-2 bg-[#003087]/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-[#003087]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter">Total Capacity</p>
              <p className="text-xl font-black text-[#003087]">{total}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Map Canvas */}
        <Card className="border-[#003087]/10 shadow-2xl shadow-[#003087]/5 rounded-[2.5rem] overflow-hidden bg-slate-50">
          <CardHeader className="bg-white border-b border-[#003087]/10 px-8 py-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full h-8 text-[10px] font-black uppercase">Floor 1</Button>
                <Button variant="ghost" size="sm" className="rounded-full h-8 text-[10px] font-black uppercase text-[#003087]/40">Floor 2</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#003087]/30" />
                <Input placeholder="Search slot..." className="h-8 pl-9 w-40 rounded-full text-xs border-[#003087]/10 focus-visible:ring-[#003087]" />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#003087]/10">
                <Filter className="h-3.5 w-3.5 text-[#003087]" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden relative min-h-[600px] flex items-center justify-center bg-[#003087]/[0.02]">
            <svg 
              viewBox="0 0 500 550" 
              className="w-full h-full max-w-[800px] select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Parking Lot Background */}
              <rect x="50" y="50" width="400" height="450" rx="20" fill="white" stroke="#003087" strokeWidth="0.5" strokeDasharray="4 4" />
              
              {/* Lanes */}
              <rect x="70" y="140" width="360" height="40" fill="#003087" fillOpacity="0.03" rx="4" />
              <rect x="70" y="340" width="360" height="40" fill="#003087" fillOpacity="0.03" rx="4" />

              {/* Slots */}
              {MOCK_SLOTS.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const slotWidth = slot.type === "MOTORBIKE" ? 25 : 50;
                const slotHeight = 80;

                return (
                  <g 
                    key={slot.id} 
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {/* Slot Boundary */}
                    <rect 
                      x={slot.x} 
                      y={slot.y} 
                      width={slotWidth} 
                      height={slotHeight} 
                      rx="4"
                      fill={isSelected ? "#00308710" : "transparent"}
                      stroke={isSelected ? "#003087" : "#00308715"}
                      strokeWidth={isSelected ? "2" : "1"}
                    />

                    {/* Status Indicator */}
                    <circle 
                      cx={slot.x + slotWidth / 2} 
                      cy={slot.y + slotHeight / 2} 
                      r="12" 
                      fill={
                        slot.status === "AVAILABLE" ? "#22c55e" : 
                        slot.status === "OCCUPIED" ? "#ef4444" : "#f59e0b"
                      }
                      className={slot.status === "AVAILABLE" ? "animate-pulse" : ""}
                      fillOpacity={0.2}
                    />
                    <circle 
                      cx={slot.x + slotWidth / 2} 
                      cy={slot.y + slotHeight / 2} 
                      r="4" 
                      fill={
                        slot.status === "AVAILABLE" ? "#22c55e" : 
                        slot.status === "OCCUPIED" ? "#ef4444" : "#f59e0b"
                      }
                    />

                    {/* Slot Label */}
                    <text 
                      x={slot.x + slotWidth / 2} 
                      y={slot.y + 15} 
                      textAnchor="middle" 
                      fontSize="8" 
                      fontWeight="900"
                      fill="#003087"
                      fillOpacity={0.4}
                    >
                      {slot.number}
                    </text>

                    {/* Icon based on type */}
                    {slot.type === "EV" && (
                      <path 
                        d="M3.5 13.5l1.5-5h-3.5l4-8.5-1.5 5h3.5l-4 8.5z" 
                        transform={`translate(${slot.x + slotWidth/2 - 4}, ${slot.y + slotHeight - 15}) scale(0.6)`}
                        fill="#003087"
                        fillOpacity={0.2}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Float Legend */}
            <div className="absolute bottom-6 left-6 p-4 bg-white/80 backdrop-blur-md border border-[#003087]/10 rounded-2xl flex gap-6 shadow-xl shadow-[#003087]/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-[#003087] uppercase tracking-wider">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[10px] font-black text-[#003087] uppercase tracking-wider">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-[#003087] uppercase tracking-wider">Reserved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-[#003087]/10 shadow-xl shadow-[#003087]/5 rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-[#003087] text-white p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Slot Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {selectedSlot ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter">Slot Number</p>
                      <h2 className="text-3xl font-black text-[#003087]">{selectedSlot.number}</h2>
                    </div>
                    <Badge className={`rounded-xl px-4 py-1 font-black text-[10px] uppercase ${
                      selectedSlot.status === "AVAILABLE" ? "bg-green-500" : 
                      selectedSlot.status === "OCCUPIED" ? "bg-red-500" : "bg-amber-500"
                    }`}>
                      {selectedSlot.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#003087]/5 rounded-2xl border border-[#003087]/10">
                      <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter mb-1">Vehicle Type</p>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-[#003087]" />
                        <span className="text-sm font-bold text-[#003087]">{selectedSlot.type}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#003087]/5 rounded-2xl border border-[#003087]/10">
                      <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter mb-1">Floor</p>
                      <span className="text-sm font-bold text-[#003087]">Level 1</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter">Connected Devices</p>
                    <div className="flex items-center justify-between p-3 bg-white border border-[#003087]/10 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-[#003087]">Sensor-S042</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-bold border-[#003087]/20 text-[#003087]/60">ONLINE</Badge>
                    </div>
                  </div>

                  <Button className="w-full bg-[#003087] hover:bg-[#003087]/90 rounded-2xl h-12 font-black shadow-lg shadow-[#003087]/20 transition-all active:scale-95">
                    View Activity Log
                  </Button>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#003087]/5 rounded-full flex items-center justify-center mx-auto">
                    <Info className="h-8 w-8 text-[#003087]/20" />
                  </div>
                  <p className="text-sm font-bold text-[#003087]/40 px-6 leading-relaxed">
                    Select a parking slot on the map to view real-time occupancy and device status.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#003087]/10 shadow-xl shadow-[#003087]/5 rounded-[2rem] bg-gradient-to-br from-[#003087] to-[#0047cc] text-white p-6">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4 opacity-60">System Insights</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Peak Occupancy</p>
                  <p className="text-xl font-black">84%</p>
                </div>
                <div className="h-10 w-24 bg-white/10 rounded-lg flex items-end gap-1 p-1">
                  <div className="flex-1 bg-white/20 h-[30%] rounded-sm" />
                  <div className="flex-1 bg-white/20 h-[60%] rounded-sm" />
                  <div className="flex-1 bg-white/20 h-[80%] rounded-sm" />
                  <div className="flex-1 bg-white h-[95%] rounded-sm" />
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <p className="text-[10px] font-bold opacity-60 leading-relaxed italic">
                * Current data suggests high demand in Zone A. Recommending dynamic pricing adjustment.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
