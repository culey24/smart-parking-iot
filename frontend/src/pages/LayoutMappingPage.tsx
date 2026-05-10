import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Gauge, 
  Radio, 
  ArrowLeft, 
  Monitor, 
  Square, 
  Link as LinkIcon,
  MousePointer2,
  Trash2,
  Map as RoadIcon,
  Circle,
  ChevronRight,
  ChevronLeft,
  Hand,
  Triangle,
  Square as SquareIcon,
  RotateCcw,
  RotateCw,
  Cloud,
  Save,
  LogIn,
  Info,
  Navigation2,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ClipboardPaste
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlacedDevice, MappedDeviceType, CanvasTransform } from "@/types/layoutMapping";
import { CAMPUS_PARKING_ALPHA } from "@/data/parkingMapData";
import { cn } from "@/lib/utils";
import { getRectPoints, getClosestPointOnPolygonPerimeter } from "@/utils/mapGeometry";
import { layoutService } from "@/services/layoutService";

const SNAP_SIZE = 1;
const DEVICE_PALETTE: { type: MappedDeviceType; label: string; icon: any; color: string; description: string; variant?: string }[] = [
  { type: "zone", label: "Zone (Rect)", icon: SquareIcon, color: "bg-slate-500", description: "Rectangle area", variant: "rectangle" },
  { type: "zone", label: "Zone (Tri)", icon: Triangle, color: "bg-slate-400", description: "Triangle area", variant: "triangle" },
  { type: "sensor", label: "IoT Sensor", icon: Gauge, color: "bg-blue-500", description: "Occupancy Detection" },
  { type: "gate", label: "Gate (Unit)", icon: Radio, color: "bg-purple-500", description: "Barrier & Controller" },
  { type: "signage", label: "Smart Signage", icon: Monitor, color: "bg-cyan-500", description: "Guidance Display" },
  { type: "road", label: "Traffic Road", icon: RoadIcon, color: "bg-slate-700", description: "Vehicle Pathway" },
  { type: "waypoint", label: "Nav Waypoint", icon: Circle, color: "bg-slate-400", description: "Path Anchor" },
];

const MOCK_DB_DEVICES = [
  { id: "device_001", name: "Entry Sensor North", type: "sensor" },
  { id: "device_002", name: "Main Entrance Gate", type: "gate" },
  { id: "device_003", name: "Lot B Display", type: "signage" },
];


export function LayoutMappingPage() {
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const [history, setHistory] = useState<PlacedDevice[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [mode, setMode] = useState<"select" | "delete" | "pan" | "draw-rect" | "draw-tri" | "connect">("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<PlacedDevice | null>(null);
  
  const [transform, setTransform] = useState<CanvasTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggedDeviceId, setDraggedDeviceId] = useState<string | null>(null);
  
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [snapEnabled] = useState(true);
  
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
  
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // History Management
  const addToHistory = useCallback((newState: PlacedDevice[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setPlacedDevices(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setPlacedDevices(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const copySelected = useCallback(() => {
    if (!selectedId) return;
    const device = placedDevices.find(d => d.id === selectedId);
    if (device && device.type !== 'connection') {
      setClipboard(device);
    }
  }, [selectedId, placedDevices]);

  const pasteClipboard = useCallback(() => {
    if (!clipboard) return;
    const id = crypto.randomUUID();
    const newDevice: PlacedDevice = {
      ...clipboard,
      id,
      x: clipboard.x + 2,
      y: clipboard.y + 2,
      label: `${clipboard.label} (Copy)`,
      deviceId: undefined,
    };
    
    if (newDevice.type === 'zone' && newDevice.points) {
       newDevice.points = newDevice.points.map(p => ({ x: p.x + 2, y: p.y + 2 }));
    }

    const newState = [...placedDevices, newDevice];
    
    if (clipboard.type === 'zone') {
       const children = placedDevices.filter(d => d.parentId === clipboard.id);
       children.forEach(child => {
          const childId = crypto.randomUUID();
          newState.push({ ...child, id: childId, parentId: id, x: child.x + 2, y: child.y + 2 });
       });
    }

    setPlacedDevices(newState);
    addToHistory(newState);
    setSelectedId(id);
  }, [clipboard, placedDevices, addToHistory]);

  // Initial Load
  useEffect(() => {
    const initLayout = async () => {
      try {
        const cloudData = await layoutService.getMapping();
        if (cloudData.layout && cloudData.layout.length > 0) {
          setPlacedDevices(cloudData.layout);
          setHistory([cloudData.layout]);
          setHistoryIndex(0);
        } else {
          const local = localStorage.getItem("parking_layout_mapping");
          if (local) {
            const parsed = JSON.parse(local);
            setPlacedDevices(parsed);
            setHistory([parsed]);
            setHistoryIndex(0);
            setHasUnsavedChanges(true);
          }
        }
      } catch (e) {
        console.error("Failed to load layout from cloud", e);
      }
    };
    initLayout();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePressed(true);
      if (e.code === "Escape") {
        setMode("select");
        setDrawingPoints([]);
        setConnectionSourceId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
        e.preventDefault();
        saveLayout();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
        e.preventDefault();
        copySelected();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        e.preventDefault();
        pasteClipboard();
      }
      if (e.code === "Delete" || e.code === "Backspace") {
         if (selectedId) deleteElement(selectedId);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedId, historyIndex, history, placedDevices, copySelected, pasteClipboard]);

  const saveLayout = async () => {
    setSyncing(true);
    try {
      await layoutService.updateMapping(placedDevices);
      localStorage.removeItem("parking_layout_mapping");
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error("Failed to sync layout", e);
    } finally {
      setSyncing(false);
    }
  };

  const deleteElement = (id: string) => {
    const newState = placedDevices.filter((d) => d.id !== id);
    setPlacedDevices(newState);
    addToHistory(newState);
    setSelectedId(null);
  };

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    let x = ((clientX - rect.left) / (rect.width)) * 100;
    let y = ((clientY - rect.top) / (rect.height)) * 100;
    if (snapEnabled) {
      x = Math.round(x / SNAP_SIZE) * SNAP_SIZE;
      y = Math.round(y / SNAP_SIZE) * SNAP_SIZE;
    }
    return { x, y };
  }, [snapEnabled]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale * delta, 0.2), 5) }));
    }
  }, []);

  useEffect(() => {
    const canvas = mapRef.current;
    if (canvas) canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas?.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (e.button === 1 || (e.button === 0 && (isSpacePressed || mode === "pan"))) {
      setIsPanning(true);
      return;
    }
    if (mode === "draw-rect" || mode === "draw-tri") {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const newPoints = [...drawingPoints, { x, y }];
      if (mode === "draw-rect" && newPoints.length === 2) finalizeShape("rectangle", getRectPoints(newPoints[0], newPoints[1]));
      else if (mode === "draw-tri" && newPoints.length === 3) finalizeShape("polygon", newPoints);
      else setDrawingPoints(newPoints);
      return;
    }
    if (mode === "select" || mode === "delete") setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = (e.clientX - lastMousePos.current.x);
    const dy = (e.clientY - lastMousePos.current.y);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (isPanning) {
      setTransform(prev => ({ ...prev, offsetX: prev.offsetX + dx, offsetY: prev.offsetY + dy }));
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (draggedDeviceId) {
      const dev = placedDevices.find(d => d.id === draggedDeviceId);
      if (dev?.type === "zone" && dev.points) {
         const dxPct = (dx / (mapRef.current?.getBoundingClientRect().width || 1)) * 100;
         const dyPct = (dy / (mapRef.current?.getBoundingClientRect().height || 1)) * 100;
         setPlacedDevices(prev => prev.map(d => {
            if (d.id === draggedDeviceId) return { ...d, x: d.x + dxPct, y: d.y + dyPct, points: d.points?.map(p => ({ x: p.x + dxPct, y: p.y + dyPct })) };
            if (d.type === "entrance" && d.parentId === draggedDeviceId) return { ...d, x: d.x + dxPct, y: d.y + dyPct };
            return d;
         }));
         return;
      }
      if (dev?.type === "entrance" && dev.parentId) {
        const parentZone = placedDevices.find(d => d.id === dev.parentId);
        if (parentZone?.points) {
          const constrained = getClosestPointOnPolygonPerimeter({ x, y }, parentZone.points);
          setPlacedDevices(prev => prev.map(d => d.id === draggedDeviceId ? { ...d, x: constrained.x, y: constrained.y } : d));
          return;
        }
      }
      setPlacedDevices(prev => prev.map(d => d.id === draggedDeviceId ? { ...d, x, y } : d));
      return;
    }
  };

  const handleMouseUp = () => {
    if (draggedDeviceId) addToHistory(placedDevices);
    setIsPanning(false); setDraggedDeviceId(null);
  };

  const finalizeShape = (shape: "rectangle" | "polygon", points: {x: number, y: number}[]) => {
    const id = crypto.randomUUID();
    const centerX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
    const centerY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
    const newZone: PlacedDevice = { id, type: "zone", x: centerX, y: centerY, shape, points, label: `Zone ${id.substring(0, 4)}` };
    const entranceId = crypto.randomUUID();
    const entrancePos = getClosestPointOnPolygonPerimeter({ x: centerX, y: centerY - 5 }, points);
    const newEntrance: PlacedDevice = { id: entranceId, type: "entrance", x: entrancePos.x, y: entrancePos.y, label: `Entrance ${id.substring(0, 4)}`, parentId: id };
    const newState = [...placedDevices, newZone, newEntrance];
    setPlacedDevices(newState);
    addToHistory(newState);
    setDrawingPoints([]);
    setMode("select");
    setSelectedId(id);
  };

  const handleDeviceClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (mode === "delete") { deleteElement(id); return; }
    if (mode === "connect") {
       if (!connectionSourceId) {
          setConnectionSourceId(id);
       } else if (connectionSourceId !== id) {
          const source = placedDevices.find(d => d.id === connectionSourceId);
          const target = placedDevices.find(d => d.id === id);
          
          if (!source || !target) {
            setConnectionSourceId(null);
            return;
          }

          const connId = crypto.randomUUID();
          const newConn: PlacedDevice = { 
            id: connId, 
            type: "connection", 
            sourceId: connectionSourceId, 
            targetId: id, 
            x: source.x, 
            y: source.y, 
            endX: target.x, 
            endY: target.y, 
            label: `Route ${connId.substring(0, 4)}` 
          };
          const newState = [...placedDevices, newConn];
          setPlacedDevices(newState);
          addToHistory(newState);
          setConnectionSourceId(null);
          setSelectedId(connId);
       } else {
          setConnectionSourceId(null);
       }
       return;
    }
    setSelectedId(id);
    setDraggedDeviceId(id);
  };


  const handleMapDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/device-type") as MappedDeviceType;
    const variant = e.dataTransfer.getData("application/device-variant");
    if (!type || !mapRef.current) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    if (type === "zone") { setMode(variant === "rectangle" ? "draw-rect" : "draw-tri"); setDrawingPoints([{ x, y }]); return; }
    const id = crypto.randomUUID();
    const newDevice: PlacedDevice = { id, type, x, y, label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.substring(0, 4)}` };
    const newState = [...placedDevices, newDevice];
    setPlacedDevices(newState);
    addToHistory(newState);
    setSelectedId(id);
  }, [screenToCanvas, placedDevices, addToHistory]);

  const updateDeviceLabel = (id: string, newLabel: string) => {
    const newState = placedDevices.map(d => d.id === id ? { ...d, label: newLabel } : d);
    setPlacedDevices(newState);
    addToHistory(newState);
  };

  const updateDeviceBinding = (id: string, deviceId: string) => {
    const newState = placedDevices.map(d => d.id === id ? { ...d, deviceId } : d);
    setPlacedDevices(newState);
    addToHistory(newState);
  };

  const getEffectiveCoords = (deviceId: string | undefined, fallbackX: number, fallbackY: number) => {
    if (!deviceId) return { x: fallbackX, y: fallbackY };
    const dev = placedDevices.find(d => d.id === deviceId);
    if (!dev) return { x: fallbackX, y: fallbackY };
    return { x: dev.x, y: dev.y };
  };


  const getConnectionLinePx = (conn: PlacedDevice) => {
    const start = getEffectiveCoords(conn.sourceId, conn.x, conn.y);
    const end = getEffectiveCoords(conn.targetId, conn.endX || conn.x + 10, conn.endY || conn.y + 10);
    return {
      x1: (start.x / 100) * CAMPUS_PARKING_ALPHA.dimensions.width,
      y1: (start.y / 100) * CAMPUS_PARKING_ALPHA.dimensions.height,
      x2: (end.x / 100) * CAMPUS_PARKING_ALPHA.dimensions.width,
      y2: (end.y / 100) * CAMPUS_PARKING_ALPHA.dimensions.height
    };
  };

  const viewBox = `0 0 ${CAMPUS_PARKING_ALPHA.dimensions.width} ${CAMPUS_PARKING_ALPHA.dimensions.height}`;

  const selectedDevice = useMemo(() => placedDevices.find(d => d.id === selectedId), [selectedId, placedDevices]);

  const getTrafficLogic = (id: string) => {
    const outgoing = placedDevices.filter(d => d.type === 'connection' && d.sourceId === id);
    const incoming = placedDevices.filter(d => d.type === 'connection' && d.targetId === id);
    
    const mapRoute = (c: PlacedDevice) => {
       const otherId = c.sourceId === id ? c.targetId : c.sourceId;
       const other = placedDevices.find(t => t.id === otherId);
       if (!other) return null;
       let label = "Path Guidance";
       if (other.type === 'signage' || other.type === 'waypoint') label = "NEXT INTERSECTION";
       if (other.type === 'entrance') label = "ZONE ENTRANCE";
       if (other.type === 'sensor') label = "SLOT GUIDANCE";
       return { id: other.id, type: other.type, label, name: other.label };
    };

    return { 
      outgoing: outgoing.map(mapRoute).filter((r): r is NonNullable<typeof r> => r !== null), 
      incoming: incoming.map(mapRoute).filter((r): r is NonNullable<typeof r> => r !== null) 
    };
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#1e1e1e] flex flex-col overflow-hidden text-white font-sans rounded-3xl border border-white/5 shadow-2xl relative">
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#252525] z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-white/60 hover:text-white rounded-xl"><Link to="/admin-dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-bold text-white/40 px-2 py-0">REGISTRY</Badge>
            <span className="font-black text-sm tracking-tight">{CAMPUS_PARKING_ALPHA.mapName}</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bg-[#333] p-1 rounded-2xl flex items-center gap-1 shadow-2xl border border-white/5">
          <Button variant={mode === "select" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("select")} className="h-9 w-9 p-0 rounded-xl"><MousePointer2 className="h-4 w-4" /></Button>
          <Button variant={mode === "pan" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("pan")} className="h-9 w-9 p-0 rounded-xl"><Hand className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
          <Button variant={mode === "connect" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("connect")} className={cn("h-9 w-9 p-0 rounded-xl text-blue-400", mode === "connect" && "bg-blue-500/20")} title="Connection Mode (Persistent)"><LinkIcon className="h-4 w-4" /></Button>
          <Button variant={mode === "delete" ? "destructive" : "ghost"} size="sm" onClick={() => setMode("delete")} className="h-9 w-9 p-0 rounded-xl text-red-400"><Trash2 className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
          <div className="flex items-center gap-1 px-1">
             <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 p-0 rounded-lg"><RotateCcw className="h-3 w-3" /></Button>
             <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0 rounded-lg"><RotateCw className="h-3 w-3" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {clipboard && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 flex items-center gap-2">
              <Copy className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">{clipboard.type} Copied</span>
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={saveLayout} disabled={syncing || !hasUnsavedChanges} className={cn("bg-white text-black hover:bg-white/90 border-none font-black text-xs px-6 rounded-xl", hasUnsavedChanges ? "ring-2 ring-emerald-500 shadow-lg" : "opacity-50")}>
             {syncing ? <Cloud className="h-3 w-3 animate-bounce mr-2" /> : hasUnsavedChanges ? <Save className="h-3 w-3 mr-2" /> : null}
             {syncing ? "Syncing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        <Button variant="ghost" size="icon" onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className="absolute left-2 top-20 z-[60] bg-[#252525] border border-white/10 h-10 w-10 rounded-xl text-white shadow-2xl hover:bg-[#333]">
           {isLeftPanelOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="absolute right-2 top-20 z-[60] bg-[#252525] border border-white/10 h-10 w-10 rounded-xl text-white shadow-2xl hover:bg-[#333]">
           {isRightPanelOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>

        <div className={`${isLeftPanelOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/10 bg-[#252525] flex flex-col relative z-40 overflow-hidden`}>
          {isLeftPanelOpen && (
            <ScrollArea className="flex-1 p-4 pt-16">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Hardware Palette</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DEVICE_PALETTE.map(({ type, label, icon: Icon, color, variant }) => (
                      <div key={label} draggable onDragStart={(e) => {
                         const dragImg = new Image(); dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                         e.dataTransfer.setDragImage(dragImg, 0, 0);
                         e.dataTransfer.setData("application/device-type", type);
                         if (variant) e.dataTransfer.setData("application/device-variant", variant);
                      }} onClick={() => setMode("select")} className="flex flex-col cursor-grab items-center gap-2 rounded-2xl bg-white/5 border border-white/5 p-3 hover:bg-white/10">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} text-white shadow-xl`}><Icon className="h-5 w-5" /></div>
                        <span className="font-bold text-[9px] text-white/60 text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex-1 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: snapEnabled ? 'radial-gradient(circle, white 1px, transparent 1px)' : 'none', backgroundSize: '1% 1%', transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})` }} />
          <div ref={mapRef} onDrop={handleMapDrop} onDragOver={(e) => e.preventDefault()} className="relative bg-white shadow-2xl rounded-lg overflow-hidden origin-center" style={{ width: CAMPUS_PARKING_ALPHA.dimensions.width, height: CAMPUS_PARKING_ALPHA.dimensions.height, transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})` }}>
            <svg viewBox={viewBox} className="w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#fff" />
              {CAMPUS_PARKING_ALPHA.zones.map((zone: any) => (
                <g key={zone.id}>{zone.bounds && (<rect x={zone.bounds.x} y={zone.bounds.y} width={zone.bounds.width} height={zone.bounds.height} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="4" />)}</g>
              ))}
            </svg>

            {/* Zone Layer */}
            <svg viewBox={viewBox} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
               {placedDevices.filter(d => d.type === "zone").map(zone => (
                 <g key={zone.id} className="pointer-events-auto cursor-pointer" onMouseDown={(e) => handleDeviceClick(e, zone.id)}>
                    <polygon points={zone.points?.map(p => `${(p.x/100) * CAMPUS_PARKING_ALPHA.dimensions.width},${(p.y/100) * CAMPUS_PARKING_ALPHA.dimensions.height}`).join(' ')} fill={selectedId === zone.id ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)"} stroke="#3b82f6" strokeWidth={selectedId === zone.id ? "4" : "2"} strokeDasharray="5 5" />
                    <text x={(zone.x/100)*CAMPUS_PARKING_ALPHA.dimensions.width} y={(zone.y/100)*CAMPUS_PARKING_ALPHA.dimensions.height} className={cn("text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none", selectedId === zone.id ? "fill-blue-600" : "fill-blue-500/60")} textAnchor="middle" style={{ filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.5))' }}>{zone.label}</text>
                 </g>
               ))}
            </svg>

            {/* Connection Layer */}
            <svg viewBox={viewBox} className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              <defs><marker id="arrow-simple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
              {placedDevices.filter(d => d.type === "connection").map(conn => {
                const line = getConnectionLinePx(conn);
                const isSel = selectedId === conn.id;
                return (
                  <g key={conn.id} className="pointer-events-auto cursor-pointer" onMouseDown={(e) => handleDeviceClick(e, conn.id)}>
                    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="transparent" strokeWidth="15" />
                    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={isSel ? "#60a5fa" : "#3b82f6"} strokeWidth={isSel ? "3" : "2"} markerEnd="url(#arrow-simple)" />
                  </g>
                );
              })}
            </svg>

            {/* Hardware Layer */}
            {placedDevices.filter(d => d.type !== "connection" && d.type !== "zone").map((d) => {
              const pItem = DEVICE_PALETTE.find(p => p.type === d.type);
              const Icon = d.type === "entrance" ? LogIn : (pItem?.icon || Square);
              const isSel = selectedId === d.id;
              const isSource = connectionSourceId === d.id;
              
              const sizeClass = (d.type === 'sensor' || d.type === 'waypoint') ? 'h-5 w-5 rounded-md' : 'h-10 w-10 rounded-xl';
              const iconSize = (d.type === 'sensor' || d.type === 'waypoint') ? 'h-3 w-3' : 'h-5 w-5';

              return (
                <div key={d.id} onMouseDown={(e) => handleDeviceClick(e, d.id)} className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move ${isSel ? 'z-50' : 'z-30'}`} style={{ left: `${d.x}%`, top: `${d.y}%` }}>
                  <div className={cn("flex items-center justify-center transition-all", sizeClass, (isSel || isSource) ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white scale-110' : 'shadow-lg', d.type === 'entrance' ? 'bg-emerald-600 border-2 border-white' : (isSource ? 'bg-blue-600' : pItem?.color || 'bg-slate-800'), "text-white")}>
                    <Icon className={iconSize} />
                    {isSource && <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${isRightPanelOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-white/10 bg-[#252525] flex flex-col relative z-40 overflow-hidden`}>
          {isRightPanelOpen && (
            <ScrollArea className="flex-1 p-6 pt-16">
              {selectedDevice ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-lg bg-blue-500/10 text-blue-500")}>
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-tight">Property Inspector</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{selectedDevice.type}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Component Label</label>
                      <Input value={selectedDevice.label || ""} onChange={(e) => updateDeviceLabel(selectedDevice.id, e.target.value)} className="bg-white/5 border-white/10 text-xs rounded-xl text-white h-10 px-4 focus:ring-blue-500" placeholder="Enter Label..." />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                       <Button variant="outline" size="sm" onClick={copySelected} className="flex-1 bg-white/5 border-white/10 text-white/60 hover:text-white rounded-xl h-9 text-[10px] font-black uppercase"><Copy className="h-3 w-3 mr-2" /> Copy</Button>
                       <Button variant="outline" size="sm" onClick={pasteClipboard} disabled={!clipboard} className="flex-1 bg-white/5 border-white/10 text-white/60 hover:text-white rounded-xl h-9 text-[10px] font-black uppercase"><ClipboardPaste className="h-3 w-3 mr-2" /> Paste</Button>
                    </div>

                    {(selectedDevice.type === 'sensor' || selectedDevice.type === 'gate' || selectedDevice.type === 'signage') && (

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Hardware Binding</label>
                        <Select value={selectedDevice.deviceId || ""} onValueChange={(val) => updateDeviceBinding(selectedDevice.id, val)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-xs rounded-xl text-white h-10 px-4">
                            <SelectValue placeholder="Unbound" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2a2a2a] border-white/10 text-white">
                            {MOCK_DB_DEVICES.filter(d => d.type === selectedDevice.type).map(d => (
                              <SelectItem key={d.id} value={d.id} className="text-xs focus:bg-blue-500 focus:text-white">{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(selectedDevice.type !== 'zone') && (
                      <div className="space-y-6 pt-2 border-t border-white/5 mt-4">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 ml-1">
                              <ArrowUpRight className="h-3 w-3 text-blue-500" />
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Outgoing Routes</label>
                           </div>
                           <div className="space-y-2">
                             {getTrafficLogic(selectedDevice.id).outgoing.length > 0 ? (
                               getTrafficLogic(selectedDevice.id).outgoing.map((traffic, idx) => (
                                 <div key={idx} className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 group">
                                   <div className="flex items-center gap-2 mb-1">
                                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-500"><Navigation2 className="h-3 w-3 fill-current" /></div>
                                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{traffic.label}</span>
                                   </div>
                                   <div className="mt-2 flex items-center gap-2 text-white/60">
                                      <MapPin className="h-3 w-3" />
                                      <span className="text-[11px] font-bold">{traffic.name || `Target ${idx + 1}`}</span>
                                   </div>
                                 </div>
                               ))
                             ) : (
                               <div className="p-3 rounded-xl bg-white/5 border border-white/10 border-dashed text-center text-[9px] font-bold text-white/20 uppercase tracking-widest">No Outbound</div>
                             )}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-2 ml-1">
                              <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Incoming Routes</label>
                           </div>
                           <div className="space-y-2">
                             {getTrafficLogic(selectedDevice.id).incoming.length > 0 ? (
                               getTrafficLogic(selectedDevice.id).incoming.map((traffic, idx) => (
                                 <div key={idx} className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 group">
                                   <div className="flex items-center gap-2 mb-1">
                                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500"><Navigation2 className="h-3 w-3 fill-current rotate-180" /></div>
                                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">SOURCE FEED</span>
                                   </div>
                                   <div className="mt-2 flex items-center gap-2 text-white/60">
                                      <MapPin className="h-3 w-3" />
                                      <span className="text-[11px] font-bold">{traffic.name || `Source ${idx + 1}`}</span>
                                   </div>
                                 </div>
                               ))
                             ) : (
                               <div className="p-3 rounded-xl bg-white/5 border border-white/10 border-dashed text-center text-[9px] font-bold text-white/20 uppercase tracking-widest">No Inbound</div>
                             )}
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button variant="destructive" className="w-full text-xs font-black rounded-xl h-10 shadow-lg shadow-red-500/10 hover:bg-red-600 transition-all" onClick={() => deleteElement(selectedDevice.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> 
                        Remove Component
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <MousePointer2 className="h-10 w-10 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select an object</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
