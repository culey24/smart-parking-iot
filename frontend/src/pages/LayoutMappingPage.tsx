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
  MoveUpRight,
  Circle,
  Settings,
  ChevronRight,
  ChevronLeft,
  Hand,
  Maximize,
  Minimize,
  Triangle,
  Square as SquareIcon,
  RotateCcw,
  RotateCw,
  Database,
  Cloud,
  Save,
  LogIn
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

const SNAP_SIZE = 1; // percentage points for snap-to-grid
const DEVICE_PALETTE: { type: MappedDeviceType; label: string; icon: any; color: string; description: string; variant?: string }[] = [
  { type: "zone", label: "Zone (Rect)", icon: SquareIcon, color: "bg-slate-500", description: "Rectangle area", variant: "rectangle" },
  { type: "zone", label: "Zone (Tri)", icon: Triangle, color: "bg-slate-400", description: "Triangle area", variant: "triangle" },
  { type: "sensor", label: "IoT Sensor", icon: Gauge, color: "bg-blue-500", description: "Occupancy Detection" },
  { type: "gateway", label: "IoT Gateway", icon: Radio, color: "bg-purple-500", description: "Data Concentrator" },
  { type: "signage", label: "Smart Signage", icon: Monitor, color: "bg-cyan-500", description: "Guidance Display" },
  { type: "barrier", label: "Barrier", icon: Square, color: "bg-red-500", description: "Physical Gate" },
  { type: "road", label: "Traffic Road", icon: RoadIcon, color: "bg-slate-700", description: "Vehicle Pathway" },
  { type: "waypoint", label: "Nav Waypoint", icon: Circle, color: "bg-slate-400", description: "Path Anchor" },
];

// Mock database devices for binding
const MOCK_DB_DEVICES = [
  { id: "device_001", name: "Entry Sensor North", type: "sensor" },
  { id: "device_002", name: "Main Gateway", type: "gateway" },
  { id: "device_003", name: "Lot B Display", type: "signage" },
];

export function LayoutMappingPage() {
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const [history, setHistory] = useState<PlacedDevice[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [mode, setMode] = useState<"select" | "connect" | "delete" | "pan" | "draw-rect" | "draw-tri">("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<{from: string, to: string} | null>(null);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  
  const [transform, setTransform] = useState<CanvasTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggedDeviceId, setDraggedDeviceId] = useState<string | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Event Handlers
  const handleDeviceDragStart = useCallback((e: React.DragEvent, type: MappedDeviceType, variant?: string) => {
    e.dataTransfer.setData("application/device-type", type);
    if (variant) e.dataTransfer.setData("application/device-variant", variant);
    e.dataTransfer.effectAllowed = "copy";
  }, []);

  const handlePaletteClick = useCallback((type: MappedDeviceType, variant?: string) => {
    if (type === "zone") {
      setMode(variant === "rectangle" ? "draw-rect" : "draw-tri");
      setDrawingPoints([]);
      setSelectedId(null);
      setSelectedConnection(null);
    } else {
      setMode("select");
    }
  }, []);

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
      const prev = history[historyIndex - 1];
      setPlacedDevices(prev);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setPlacedDevices(next);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Initial Load & Migration
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
        setConnectionSource(null);
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
      if (e.code === "Delete" || e.code === "Backspace") {
         if (selectedId) deleteElement(selectedId);
         if (selectedConnection) deleteConnection(selectedConnection.from, selectedConnection.to);
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
  }, [selectedId, selectedConnection, historyIndex, history, placedDevices]);

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
    const newState = placedDevices.filter((d) => d.id !== id).map(d => ({
      ...d,
      connections: d.connections?.filter(connId => connId !== id)
    }));
    setPlacedDevices(newState);
    addToHistory(newState);
    setSelectedId(null);
  };

  const deleteConnection = (fromId: string, toId: string) => {
    const newState = placedDevices.map(d => d.id === fromId ? {
      ...d,
      connections: d.connections?.filter(id => id !== toId)
    } : d);
    setPlacedDevices(newState);
    addToHistory(newState);
    setSelectedConnection(null);
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
      setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * delta, 0.2), 5)
      }));
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
      
      if (mode === "draw-rect" && newPoints.length === 2) {
        finalizeShape("rectangle", getRectPoints(newPoints[0], newPoints[1]));
      } else if (mode === "draw-tri" && newPoints.length === 3) {
        finalizeShape("polygon", newPoints);
      } else {
        setDrawingPoints(newPoints);
      }
      return;
    }

    if (mode === "select" || mode === "delete") {
       setSelectedId(null);
       setSelectedConnection(null);
       setConnectionSource(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = (e.clientX - lastMousePos.current.x);
    const dy = (e.clientY - lastMousePos.current.y);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy
      }));
      return;
    }

    if (draggedDeviceId) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const dev = placedDevices.find(d => d.id === draggedDeviceId);
      
      // Constraint Logic for Entrance Nodes
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
    if (draggedDeviceId) {
      addToHistory(placedDevices);
    }
    setIsPanning(false);
    setDraggedDeviceId(null);
  };

  const finalizeShape = (shape: "rectangle" | "polygon", points: {x: number, y: number}[]) => {
    const id = crypto.randomUUID();
    const centerX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
    const centerY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
    
    const newZone: PlacedDevice = {
      id,
      type: "zone",
      x: centerX,
      y: centerY,
      shape,
      points,
      label: `Zone ${id.substring(0, 4)}`
    };

    // Calculate edge-aligned entrance (default to center-top point)
    const entranceId = crypto.randomUUID();
    const entrancePos = getClosestPointOnPolygonPerimeter({ x: centerX, y: centerY - 5 }, points);

    const newEntrance: PlacedDevice = {
      id: entranceId,
      type: "entrance",
      x: entrancePos.x,
      y: entrancePos.y,
      label: `Entrance ${id.substring(0, 4)}`,
      parentId: id
    };

    const newState = [...placedDevices, newZone, newEntrance];
    setPlacedDevices(newState);
    addToHistory(newState);
    setDrawingPoints([]);
    setMode("select");
    setSelectedId(id);
  };

  const handleDeviceClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (mode === "delete") {
      deleteElement(id);
      return;
    }

    if (mode === "connect") {
      if (!connectionSource) {
        setConnectionSource(id);
      } else if (connectionSource !== id) {
        const newState = placedDevices.map((d) => {
          if (d.id === connectionSource) {
            const connections = [...(d.connections || [])];
            if (!connections.includes(id)) connections.push(id);
            return { ...d, connections };
          }
          return d;
        });
        setPlacedDevices(newState);
        addToHistory(newState);
        setConnectionSource(null);
      } else {
        setConnectionSource(null);
      }
      return;
    }

    if (mode === "select" || mode === "pan") {
      setSelectedId(id);
      setSelectedConnection(null);
      setDraggedDeviceId(id);
    }
  };

  const handleMapDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/device-type") as MappedDeviceType;
    const variant = e.dataTransfer.getData("application/device-variant");
    if (!type || !mapRef.current) return;
    
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    
    if (type === "zone") {
      setMode(variant === "rectangle" ? "draw-rect" : "draw-tri");
      setDrawingPoints([{ x, y }]);
      return;
    }

    const id = crypto.randomUUID();
    const newDevice: PlacedDevice = { 
      id, 
      type, 
      x, 
      y, 
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.substring(0, 4)}`,
    };
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

  const selectedDevice = useMemo(() => placedDevices.find(d => d.id === selectedId), [placedDevices, selectedId]);

  const getSignageDirections = (signage: PlacedDevice) => {
    if (signage.type !== "signage") return [];
    return (signage.connections || []).map(targetId => {
      const target = placedDevices.find(d => d.id === targetId);
      if (!target) return null;
      const dx = target.x - signage.x;
      const dy = target.y - signage.y;
      let displayMsg = "UNKNOWN";
      if (target.type === "signage") displayMsg = "NEXT INTERSECTION";
      if (target.type === "entrance") displayMsg = "ZONE ENTRANCE";
      if (target.type === "sensor") displayMsg = "SLOT GUIDANCE";
      return { id: targetId, msg: displayMsg, angle: Math.atan2(dy, dx) * (180 / Math.PI) };
    }).filter((dir): dir is { id: string; msg: string; angle: number } => dir !== null);
  };

  const viewBox = `0 0 ${CAMPUS_PARKING_ALPHA.dimensions.width} ${CAMPUS_PARKING_ALPHA.dimensions.height}`;

  return (
    <div className="h-[calc(100vh-80px)] bg-[#1e1e1e] flex flex-col overflow-hidden text-white font-sans rounded-3xl border border-white/5 shadow-2xl relative">
      {/* Top Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#252525] z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-white/60 hover:text-white rounded-xl">
            <Link to="/admin-dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-bold text-white/40 px-2 py-0">REGISTRY</Badge>
            <span className="font-black text-sm tracking-tight">{CAMPUS_PARKING_ALPHA.mapName}</span>
          </div>
        </div>

        {/* Floating Toolbar (Top Center) */}
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#333] p-1 rounded-2xl flex items-center gap-1 shadow-2xl border border-white/5">
          <Button variant={mode === "select" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("select")} className="h-9 w-9 p-0 rounded-xl">
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button variant={mode === "pan" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("pan")} className="h-9 w-9 p-0 rounded-xl">
            <Hand className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
          <Button variant={mode === "connect" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("connect")} className="h-9 w-9 p-0 rounded-xl text-blue-400">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant={mode === "delete" ? "destructive" : "ghost"} size="sm" onClick={() => setMode("delete")} className="h-9 w-9 p-0 rounded-xl text-red-400">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
          <div className="flex items-center gap-1 px-1">
             <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 p-0 rounded-lg"><RotateCcw className="h-3 w-3" /></Button>
             <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 p-0 rounded-lg"><RotateCw className="h-3 w-3" /></Button>
          </div>
          <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
          <div className="flex items-center gap-2 px-3">
             <Button variant="ghost" size="icon" onClick={() => setTransform(p => ({...p, scale: Math.max(p.scale - 0.1, 0.2)}))} className="h-7 w-7"><Minimize className="h-3 w-3" /></Button>
             <span className="text-[10px] font-black w-8 text-center">{Math.round(transform.scale * 100)}%</span>
             <Button variant="ghost" size="icon" onClick={() => setTransform(p => ({...p, scale: Math.min(p.scale + 0.1, 5)}))} className="h-7 w-7"><Maximize className="h-3 w-3" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" size="sm" 
            onClick={saveLayout} 
            disabled={syncing || !hasUnsavedChanges}
            className={cn(
              "bg-white text-black hover:bg-white/90 border-none font-black text-xs px-6 rounded-xl relative overflow-hidden transition-all",
              hasUnsavedChanges ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "opacity-50"
            )}
          >
             {syncing ? <Cloud className="h-3 w-3 animate-bounce mr-2" /> : hasUnsavedChanges ? <Save className="h-3 w-3 mr-2" /> : null}
             {syncing ? "Syncing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <div className={`${isLeftPanelOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/10 bg-[#252525] flex flex-col relative z-40`}>
          <Button 
            variant="ghost" size="icon" 
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-50 bg-[#252525] border border-white/10 h-8 w-8 rounded-full text-white/40 hover:text-white shadow-xl"
          >
            {isLeftPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          {isLeftPanelOpen && (
            <ScrollArea className="flex-1 p-4 overflow-hidden">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Hardware Palette</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DEVICE_PALETTE.map(({ type, label, icon: Icon, color, variant }) => (
                      <div
                        key={label}
                        draggable
                        onDragStart={(e) => handleDeviceDragStart(e, type, variant)}
                        onClick={() => handlePaletteClick(type, variant)}
                        className={cn(
                          "group flex flex-col cursor-grab items-center gap-2 rounded-2xl bg-white/5 border border-white/5 p-3 transition-all hover:bg-white/10 active:cursor-grabbing",
                          mode === (variant === "rectangle" ? "draw-rect" : "draw-tri") && "border-blue-500 bg-blue-500/10"
                        )}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} text-white shadow-xl`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-[9px] text-white/60 text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Canvas Settings</h3>
                   <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold text-white/60">Snap to Grid (1%)</span>
                      <Button variant={snapEnabled ? "secondary" : "ghost"} size="sm" onClick={() => setSnapEnabled(!snapEnabled)} className="h-6 px-2 text-[8px] font-black uppercase">
                        {snapEnabled ? "ON" : "OFF"}
                      </Button>
                   </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center cursor-default"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}>
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: snapEnabled ? 'radial-gradient(circle, white 1px, transparent 1px)' : 'none', 
                 backgroundSize: '1% 1%',
                 transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`
               }} />

          <div
            ref={mapRef}
            onDrop={handleMapDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden select-none origin-center"
            style={{ 
              width: CAMPUS_PARKING_ALPHA.dimensions.width, 
              height: CAMPUS_PARKING_ALPHA.dimensions.height,
              transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
              cursor: mode === "pan" || isPanning ? "grabbing" : (mode.startsWith("draw") ? "crosshair" : "default")
            }}
          >
            {/* Architecture Layer */}
            <svg viewBox={viewBox} className="w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#fff" />
              {CAMPUS_PARKING_ALPHA.zones.map((zone: any, zIdx: number) => {
                const isModular = zone.type === 'MODULAR_SLOTS' || zone.type === 'VERTICAL_STORAGE';
                const isOpen = zone.type === 'OPEN_PARKING';
                const isCustom = zone.type === 'CUSTOM_ZONE';
                return (
                  <g key={zone.id || zIdx}>
                    {(isModular || isOpen) && zone.bounds && (
                      <rect x={zone.bounds.x} y={zone.bounds.y} width={zone.bounds.width} height={zone.bounds.height} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="4" />
                    )}
                    {isModular && zone.bounds && zone.slots?.map((slot: any) => (
                      <rect key={slot.id} x={zone.bounds!.x + slot.relX} y={zone.bounds!.y + slot.relY} width={slot.w} height={slot.h} fill="white" stroke="#f1f5f9" strokeWidth="1" rx="2" />
                    ))}
                    {isCustom && zone.path && (
                      <polygon points={zone.path.map((p: any) => p.join(',')).join(' ')} fill="#fffbeb" stroke="#fef3c7" strokeWidth="1" />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Dynamic Geometry Layer (Polygons/Zones) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ pointerEvents: 'none' }}>
              {placedDevices.filter(d => d.type === "zone").map(zone => (
                <g key={zone.id} className="pointer-events-auto cursor-pointer" style={{ pointerEvents: 'auto' }} onClick={(e) => handleDeviceClick(e, zone.id)}>
                  {zone.points && (
                    <polygon 
                      points={zone.points.map(p => `${(p.x/100) * CAMPUS_PARKING_ALPHA.dimensions.width},${(p.y/100) * CAMPUS_PARKING_ALPHA.dimensions.height}`).join(' ')} 
                      fill={selectedId === zone.id ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.15)"} 
                      stroke="#3b82f6" 
                      strokeWidth={selectedId === zone.id ? "4" : "2"}
                      strokeDasharray="5 5"
                    />
                  )}
                </g>
              ))}
              
              {/* Active Drawing Visual */}
              {drawingPoints.length > 0 && (
                <polyline 
                  points={drawingPoints.map(p => `${(p.x/100) * CAMPUS_PARKING_ALPHA.dimensions.width},${(p.y/100) * CAMPUS_PARKING_ALPHA.dimensions.height}`).join(' ')} 
                  fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 5"
                />
              )}
            </svg>

            {/* Traffic Vector Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" style={{ pointerEvents: 'none' }}>
              <defs>
                <marker id="arrow-pro" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
                <marker id="arrow-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                </marker>
              </defs>
              {placedDevices.map(device => 
                device.connections?.map(targetId => {
                  const target = placedDevices.find(d => d.id === targetId);
                  if (!target) return null;
                  const isSel = selectedConnection?.from === device.id && selectedConnection?.to === targetId;
                  const isSlot = target.type === "sensor";
                  
                  return (
                    <g key={`${device.id}-${targetId}`} className="pointer-events-auto cursor-pointer" style={{ pointerEvents: 'auto' }} onClick={(e) => {
                      e.stopPropagation();
                      if (mode === "delete") deleteConnection(device.id, targetId);
                      else { setSelectedConnection({from: device.id, to: targetId}); setSelectedId(null); }
                    }}>
                      <line
                        x1={`${device.x}%`} y1={`${device.y}%`}
                        x2={`${target.x}%`} y2={`${target.y}%`}
                        stroke="transparent" strokeWidth="20"
                      />
                      <line
                        x1={`${device.x}%`} y1={`${device.y}%`}
                        x2={`${target.x}%`} y2={`${target.y}%`}
                        stroke={isSel ? "#60a5fa" : "#3b82f6"} 
                        strokeWidth={isSel ? (isSlot ? "6" : "8") : (isSlot ? "3" : "5")}
                        strokeDasharray={isSlot ? "4 4" : ""}
                        markerEnd={isSel ? "url(#arrow-selected)" : "url(#arrow-pro)"}
                      />
                    </g>
                  );
                })
              )}
            </svg>

            {/* Hardware Placement Layer */}
            {placedDevices.filter(d => d.type !== "zone").map((d) => {
              const pItem = DEVICE_PALETTE.find(p => p.type === d.type);
              const Icon = d.type === "entrance" ? LogIn : (pItem?.icon || Square);
              const isSel = selectedId === d.id;
              const isConnSource = connectionSource === d.id;
              const isSen = d.type === "sensor";
              const isEnt = d.type === "entrance";
              const isSig = d.type === "signage";
              const isBound = !!d.deviceId;

              return (
                <div
                  key={d.id}
                  onMouseDown={(e) => handleDeviceClick(e, d.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-shadow cursor-move ${
                    isSel ? 'z-50' : 'z-30'
                  }`}
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                >
                  <div className={cn(
                    "flex items-center justify-center transition-all",
                    isSen ? 'h-5 w-5 rounded-md' : isEnt ? 'h-8 w-8 rounded-full' : 'h-10 w-10 rounded-xl',
                    isSel ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white shadow-2xl scale-110' : 'shadow-lg',
                    isEnt ? 'bg-emerald-600 border-2 border-white' : (isConnSource ? 'animate-pulse bg-blue-600' : pItem?.color || 'bg-slate-800'),
                    isBound && "ring-2 ring-emerald-500 ring-offset-2",
                    "text-white"
                  )}>
                    <Icon className={isSen ? 'h-3 w-3' : 'h-5 w-5'} />
                    {isBound && <Database className="absolute -top-1 -right-1 h-2.5 w-2.5 text-emerald-400 bg-slate-900 rounded-full" />}
                  </div>

                  {isSig && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center pointer-events-none">
                       {getSignageDirections(d).map((dir, i) => (
                         <div key={i} className="bg-slate-900/90 text-white text-[8px] font-black px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10 flex items-center gap-1 shadow-2xl">
                            <MoveUpRight className="h-2 w-2" style={{ transform: `rotate(${dir.angle - 45}deg)` }} />
                            {dir.msg}
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`${isRightPanelOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-white/10 bg-[#252525] flex flex-col relative z-40`}>
          <Button 
            variant="ghost" size="icon" 
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} 
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-50 bg-[#252525] border border-white/10 h-8 w-8 rounded-full text-white/40 hover:text-white shadow-xl"
          >
            {isRightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {isRightPanelOpen && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2 mb-1">
                  <Settings className="h-3 w-3" /> Property Inspector
                </h3>
              </div>

              <ScrollArea className="flex-1 p-6">
                {selectedDevice ? (
                  <div className="space-y-6 text-white/80">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Identification</label>
                      <Input 
                        value={selectedDevice.label} 
                        onChange={(e) => updateDeviceLabel(selectedDevice.id, e.target.value)}
                        className="bg-white/5 border-white/10 text-xs font-bold text-white rounded-xl"
                      />
                      <p className="text-[9px] font-mono text-white/20">{selectedDevice.id}</p>
                    </div>

                    {(selectedDevice.type === "sensor" || selectedDevice.type === "gateway" || selectedDevice.type === "signage") && (
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Hardware Binding</label>
                         <Select 
                           value={selectedDevice.deviceId || "none"} 
                           onValueChange={(val: string) => updateDeviceBinding(selectedDevice.id, val === "none" ? "" : val)}
                         >
                           <SelectTrigger className="bg-white/5 border-white/10 text-xs font-bold rounded-xl h-10">
                             <SelectValue placeholder="Select Real Device" />
                           </SelectTrigger>
                           <SelectContent className="bg-[#333] border-white/10 text-white rounded-xl">
                             <SelectItem value="none" className="text-xs">No Binding</SelectItem>
                             {MOCK_DB_DEVICES.filter(d => d.type === selectedDevice.type).map(dev => (
                               <SelectItem key={dev.id} value={dev.id} className="text-xs">{dev.name} ({dev.id})</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                    )}

                    <Separator className="bg-white/5" />

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Transformation</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-2 text-xs font-mono text-blue-400">X: {selectedDevice.x.toFixed(1)}%</div>
                        <div className="bg-white/5 rounded-lg p-2 text-xs font-mono text-blue-400">Y: {selectedDevice.y.toFixed(1)}%</div>
                      </div>
                    </div>

                    <Button variant="destructive" className="w-full text-xs font-black rounded-xl" onClick={() => deleteElement(selectedDevice.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Element
                    </Button>
                  </div>
                ) : selectedConnection ? (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Connection Path</h4>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                       <p className="text-xs font-bold">From: <span className="text-blue-400 truncate block">{selectedConnection.from}</span></p>
                       <p className="text-xs font-bold">To: <span className="text-blue-400 truncate block">{selectedConnection.to}</span></p>
                    </div>
                    <Button variant="destructive" className="w-full text-xs font-black rounded-xl" onClick={() => deleteConnection(selectedConnection.from, selectedConnection.to)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Connection
                    </Button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                    <MousePointer2 className="h-10 w-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Selection</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
