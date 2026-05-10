import { useState, useMemo } from 'react';
import { Code, RefreshCw, Download, Maximize2, Box, CornerUpRight, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';

interface MapData {
  mapName: string;
  dimensions: { width: number; height: number; unit: string };
  zones: any[];
}

const DEFAULT_JSON = {
  mapName: 'Campus_Parking_Alpha',
  dimensions: { width: 1000, height: 1400, unit: 'px' },
  zones: [
    {
      id: 'ZONE_LEFT_STATED',
      type: 'MODULAR_SLOTS',
      description: 'The vertical row of small blocks on the left',
      bounds: { x: 50, y: 200, width: 150, height: 800 },
      slots: [
        { id: 'SLOT_L1', relX: 0, relY: 0, w: 150, h: 200 },
        { id: 'SLOT_L2', relX: 0, relY: 250, w: 150, h: 200 },
        { id: 'SLOT_L3', relX: 0, relY: 500, w: 150, h: 200 },
      ],
    },
    {
      id: 'ZONE_RIGHT_LARGE',
      type: 'OPEN_PARKING',
      description: 'The large rectangular blocks on the right',
      bounds: { x: 300, y: 250, width: 600, height: 700 },
      blocks: [
        { id: 'BLOCK_R1', x: 300, y: 250, w: 600, h: 250 },
        { id: 'BLOCK_R2', x: 300, y: 550, w: 600, h: 350 },
      ],
    },
    {
      id: 'ZONE_TOP_ANGLED',
      type: 'CUSTOM_ZONE',
      description: 'The top-right area with the angled/curved boundary',
      path: [
        [300, 50],
        [900, 50],
        [900, 200],
        [300, 200],
      ],
      isAngled: true,
    },
    {
      id: 'ENTRY_EXIT_POINT',
      type: 'GATEWAY',
      bounds: { x: 200, y: 1200, width: 200, height: 50 },
    },
  ],
};

export default function ParkingMapVisualizerPage() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [parsedData, setParsedData] = useState<MapData>(DEFAULT_JSON);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    try {
      const data = JSON.parse(jsonInput);
      setParsedData(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const viewBox = useMemo(() => {
    const { width, height } = parsedData.dimensions;
    return `0 0 ${width} ${height}`;
  }, [parsedData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 max-w-[1600px] mx-auto pb-10">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-[#003087] tracking-tight flex items-center gap-3">
            <Code className="h-8 w-8 text-[#003087]" />
            Map Visualizer
          </h1>
          <p className="text-xs text-[#003087]/50 font-bold mt-1 uppercase tracking-widest">
            JSON-to-SVG Architectural Engine
          </p>
        </div>

        <Card className="border-[#003087]/10 shadow-2xl shadow-[#003087]/5 rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-[#003087] text-white p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Edit Definition
            </CardTitle>
            {error && (
              <Badge variant="destructive" className="animate-pulse text-[10px]">
                Invalid JSON
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonInput(e.target.value)}
              className="min-h-[600px] font-mono text-[11px] bg-slate-50 border-[#003087]/10 focus-visible:ring-[#003087] rounded-xl resize-none"
              spellCheck={false}
            />
            <Button
              onClick={handleUpdate}
              className="w-full bg-[#003087] hover:bg-[#003087]/90 rounded-xl h-12 font-black shadow-lg shadow-[#003087]/20"
            >
              Update Visualization
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#003087]/10 shadow-xl shadow-[#003087]/5 rounded-2xl bg-white p-6">
          <h4 className="text-[10px] font-black text-[#003087]/40 uppercase tracking-widest mb-4">
            Schema Guide
          </h4>
          <div className="space-y-3">
            {[
              { icon: Box, label: 'MODULAR_SLOTS', color: 'bg-blue-500' },
              { icon: Maximize2, label: 'OPEN_PARKING', color: 'bg-green-500' },
              { icon: CornerUpRight, label: 'CUSTOM_ZONE', color: 'bg-amber-500' },
              { icon: Zap, label: 'GATEWAY', color: 'bg-red-500' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs font-bold text-[#003087]"
              >
                <div className="flex items-center gap-2">
                  <item.icon className={`h-3 w-3 ${item.color.replace('bg-', 'text-')}`} />
                  {item.label}
                </div>
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Visualization Canvas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge className="bg-[#003087] rounded-xl px-4 py-1 font-black text-[10px] uppercase">
              {parsedData.mapName}
            </Badge>
            <span className="text-[10px] font-black text-[#003087]/40 uppercase tracking-widest">
              {parsedData.dimensions.width} x {parsedData.dimensions.height}{' '}
              {parsedData.dimensions.unit}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-bold gap-2 text-[#003087] border-[#003087]/10"
          >
            <Download className="h-4 w-4" /> Export Blueprint
          </Button>
        </div>

        <Card className="border-[#003087]/10 shadow-2xl shadow-[#003087]/5 rounded-[3rem] overflow-hidden bg-slate-50 relative flex items-center justify-center p-12 min-h-[850px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20 pointer-events-none" />

          <TooltipProvider>
            <svg
              viewBox={viewBox}
              className="w-full h-auto max-h-[1200px] shadow-2xl rounded-lg bg-white border border-[#003087]/5"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#003087" strokeWidth="0.1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {parsedData.zones.map((zone, zIdx) => {
                const isModular = zone.type === 'MODULAR_SLOTS';
                const isOpen = zone.type === 'OPEN_PARKING';
                const isCustom = zone.type === 'CUSTOM_ZONE';
                const isGateway = zone.type === 'GATEWAY';

                return (
                  <g key={zone.id || zIdx}>
                    {/* Render Main Zone Bounds */}
                    {(isModular || isOpen || isGateway) && (
                      <rect
                        x={zone.bounds.x}
                        y={zone.bounds.y}
                        width={zone.bounds.width}
                        height={zone.bounds.height}
                        fill={isGateway ? '#ef4444' : isModular ? '#3b82f6' : '#22c55e'}
                        fillOpacity={0.05}
                        stroke={isGateway ? '#ef4444' : isModular ? '#3b82f6' : '#22c55e'}
                        strokeWidth="1"
                        strokeDasharray={isGateway ? '4 2' : 'none'}
                        rx={isGateway ? 4 : 8}
                      />
                    )}

                    {/* Render Modular Slots */}
                    {isModular &&
                      zone.slots?.map((slot: any, sIdx: number) => (
                        <g key={slot.id || sIdx}>
                          <rect
                            x={zone.bounds.x + slot.relX}
                            y={zone.bounds.y + slot.relY}
                            width={slot.w}
                            height={slot.h}
                            fill="white"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            rx="4"
                          />
                          <text
                            x={zone.bounds.x + slot.relX + slot.w / 2}
                            y={zone.bounds.y + slot.relY + slot.h / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="14"
                            fontWeight="900"
                            fill="#3b82f6"
                            className="select-none"
                          >
                            {slot.id}
                          </text>
                        </g>
                      ))}

                    {/* Render Open Blocks */}
                    {isOpen &&
                      zone.blocks?.map((block: any, bIdx: number) => (
                        <g key={block.id || bIdx}>
                          <rect
                            x={block.x}
                            y={block.y}
                            width={block.w}
                            height={block.h}
                            fill="white"
                            stroke="#22c55e"
                            strokeWidth="2"
                            rx="8"
                          />
                          <text
                            x={block.x + 20}
                            y={block.y + 40}
                            fontSize="24"
                            fontWeight="900"
                            fill="#22c55e"
                            className="select-none opacity-20"
                          >
                            {block.id}
                          </text>
                        </g>
                      ))}

                    {/* Render Custom Angled Zone */}
                    {isCustom && (
                      <polygon
                        points={zone.path.map((p: number[]) => p.join(',')).join(' ')}
                        fill="#f59e0b"
                        fillOpacity={0.1}
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray="10 5"
                      />
                    )}

                    {/* Labels */}
                    <text
                      x={isCustom ? zone.path[0][0] : zone.bounds.x}
                      y={isCustom ? zone.path[0][1] - 10 : zone.bounds.y - 10}
                      fontSize="10"
                      fontWeight="900"
                      fill="#003087"
                      className="uppercase tracking-widest select-none"
                    >
                      {zone.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </TooltipProvider>

          {/* Canvas HUD */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <div className="p-3 bg-white/80 backdrop-blur-md rounded-xl border border-[#003087]/10 shadow-lg text-right">
              <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter">
                Render Engine
              </p>
              <p className="text-xs font-black text-[#003087]">SVG V2.4</p>
            </div>
            <div className="p-3 bg-white/80 backdrop-blur-md rounded-xl border border-[#003087]/10 shadow-lg text-right">
              <p className="text-[10px] font-black text-[#003087]/40 uppercase tracking-tighter">
                Auto-Scale
              </p>
              <p className="text-xs font-black text-[#003087]">Enabled</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
