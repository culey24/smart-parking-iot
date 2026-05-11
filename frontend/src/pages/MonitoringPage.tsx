import { useEffect, useRef, useState, useCallback } from "react";
import { Activity, ShieldAlert, Terminal, Clock, Info, ChevronRight, Zap } from "lucide-react";
import { layoutService } from "@/services/layoutService";
import type { PlacedDevice } from "@/types/layoutMapping";
import { CAMPUS_PARKING_ALPHA } from "@/data/parkingMapData";
import { useMonitoringSSE } from "@/hooks/useMonitoringSSE";
import { buildGraph, findPath, interpolateAlongPath, VehicleAgent } from "@/utils/vehicleSimulation";
import { randomPlate, randomVehicleType, SEEDED_SCHOOL_CARD_IDS } from "@/utils/randomPlate";
import { API_BASE, TOKEN_KEY } from "@/config/api";

const W = CAMPUS_PARKING_ALPHA.dimensions.width;
const H = CAMPUS_PARKING_ALPHA.dimensions.height;
const px = (pct: number, dim: number) => (pct / 100) * dim;
const ICON_CHARS: Record<string, string> = { sensor:"◉", gate:"⊞", signage:"◫", camera:"⊙", entrance:"→", exit:"←", waypoint:"·" };
const ANIM_DURATION = 4000;

function getStatusColor(liveData: any, deviceId?: string): string {
  if (!deviceId || !liveData) return "#2563eb";
  // Check IoT devices first (sensors have deviceId bound)
  const dev = liveData.devices?.find((d: any) => d.id === deviceId);
  if (dev) {
    if (dev.status === "error" || dev.status === "offline") return "#ef4444";
    if (dev.status === "occupied") return "#16a34a";
    return "#2563eb"; // online/idle
  }
  // Fallback: check slot list
  const slot = liveData.slots?.find((s: any) => s.id === deviceId);
  if (slot) {
    if (slot.deviceStatus === "error") return "#ef4444";
    if (slot.status === "occupied") return "#16a34a";
    return "#2563eb";
  }
  return "#2563eb";
}

export function MonitoringPage() {
  const [layout, setLayout] = useState<PlacedDevice[]>([]);
  const { liveData, logs, connected } = useMonitoringSSE();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.55);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [agents, setAgents] = useState<VehicleAgent[]>([]);
  const [simStatus, setSimStatus] = useState<"idle"|"running">("idle");
  const [toast, setToast] = useState<string | null>(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    layoutService.getMapping().then(r => setLayout(r.layout ?? []));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  // Map Slot Calculations
  const mapSensors = layout.filter(d => d.type === "sensor");
  const mapTotalSlots = mapSensors.length;
  const mapOccupied = mapSensors.filter(d => getStatusColor(liveData, d.deviceId) === "#16a34a").length;
  const mapFault    = mapSensors.filter(d => getStatusColor(liveData, d.deviceId) === "#ef4444").length;
  const mapFree     = mapTotalSlots - mapOccupied - mapFault;

  // Animation loop (Direct DOM manipulation for 60FPS smooth routing)
  useEffect(() => {
    if (agents.length === 0) return;
    let isActive = true;

    const step = () => {
      if (!isActive) return;
      const now = Date.now();
      let activeCount = 0;

      agents.forEach(agent => {
        const el = document.getElementById(`agent-${agent.id}`);
        if (!el) return;

        const progress = Math.min((now - agent.startTime) / ANIM_DURATION, 1);
        if (progress < 1) {
          activeCount++;
          const pos = interpolateAlongPath(agent.path, progress, W, H);
          el.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);
        } else {
          el.style.opacity = "0";
        }
      });

      if (activeCount === 0) {
        setSimStatus("idle");
        // Clean up finished agents
        setAgents(prev => prev.filter(a => (Date.now() - a.startTime) < ANIM_DURATION));
      } else {
        animRef.current = requestAnimationFrame(step);
      }
    };
    
    animRef.current = requestAnimationFrame(step);
    return () => { 
      isActive = false;
      if (animRef.current) cancelAnimationFrame(animRef.current); 
    };
  }, [agents]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(Math.max(s * (e.deltaY > 0 ? 0.9 : 1.1), 0.15), 4));
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el?.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onMouseDown = (e: React.MouseEvent) => { isPanning.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setOffset(p => ({ x: p.x + e.clientX - lastMouse.current.x, y: p.y + e.clientY - lastMouse.current.y }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { isPanning.current = false; };

  // Build nav graph
  const hardware = layout.filter(d => !["zone","connection","road"].includes(d.type));
  const connections = layout.filter(d => d.type === "connection");
  const roads = layout.filter(d => d.type === "road");
  const zones = layout.filter(d => d.type === "zone");
  const graph = buildGraph(hardware, connections);

  const startAnimation = (sessionId: string, plateNumber: string, color: string, startType: string, endType: string): string | null => {
    const startNode = hardware.find(d => d.type === startType);
    if (!startNode) return null;
    const path = findPath(graph, hardware, startNode.id, endType, liveData);
    let finalNode;
    if (path.length < 2) {
      // Fallback: straight line from start to center
      finalNode = hardware.find(d => d.type === endType);
      const fallbackPath = finalNode ? [{ x: startNode.x, y: startNode.y }, { x: finalNode.x, y: finalNode.y }] : [{ x: startNode.x, y: startNode.y }, { x: 50, y: 50 }];
      setAgents(prev => [...prev, { id: sessionId, path: fallbackPath, startTime: Date.now(), plateNumber, color, direction: "ENTER" }]);
    } else {
      finalNode = path[path.length - 1];
      setAgents(prev => [...prev, { id: sessionId, path: path.map(d => ({ x: d.x, y: d.y })), startTime: Date.now(), plateNumber, color, direction: "ENTER" }]);
    }
    return finalNode?.deviceId || null;
  };

  const apiCall = async (method: string, endpoint: string, body?: any, token?: string) => {
    const headers: Record<string,string> = { "Content-Type": "application/json" };
    const storedToken = token || localStorage.getItem(TOKEN_KEY);
    if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return res.json();
  };

  const enterStaff = async () => {
    if (simStatus === "running") return;
    if (mapFree <= 0) {
      showToast("❌ Entry Denied: Parking lot is completely full!");
      return;
    }
    setSimStatus("running");
    try {
      // Get active sessions to find used users
      const sessRes = await apiCall("GET", "/api/sessions");
      const activeSessions = sessRes.data?.filter((s: any) => s.sessionStatus === "ACTIVE") ?? [];
      const usedIds = new Set(activeSessions.map((s: any) => s.subjectID));
      
      // Find available seeded user
      const available = SEEDED_SCHOOL_CARD_IDS.filter(id => !usedIds.has(`USER_${parseInt(id) - 100000}`));
      if (available.length === 0) { showToast("⚠️ No available users — all are currently parked"); setSimStatus("idle"); return; }
      
      const schoolCardId = available[Math.floor(Math.random() * available.length)];
      const plateNumber = randomPlate();
      const vehicleType = randomVehicleType();

      // Login
      const loginRes = await apiCall("POST", "/api/auth/login", { schoolCardId, password: "password123" });
      if (!loginRes.success) { showToast("❌ Login failed for user " + schoolCardId); setSimStatus("idle"); return; }
      const jwt = loginRes.data.token;
      const userId = loginRes.data.user.userId;

      // Check in
      const checkinRes = await apiCall("POST", "/api/gates/check-in", { subjectID: userId, plateNumber, type: "REGISTERED", vehicleType }, jwt);
      if (!checkinRes.success) { showToast("❌ Check-in failed"); setSimStatus("idle"); return; }

      const role = loginRes.data.user.role;
      showToast(`✅ ${plateNumber} (${vehicleType}) entered as ${role}`);
      const targetDeviceId = startAnimation(checkinRes.data.sessionId, plateNumber, "#2563eb", "gate", "sensor");
      if (targetDeviceId) {
        setTimeout(async () => {
          try {
            const bindRes = await apiCall("POST", "/api/monitoring/bind", { sessionId: checkinRes.data.sessionId, deviceId: targetDeviceId }, jwt);
            if (!bindRes.success) showToast("❌ Target Binding Failed: " + bindRes.message);
          } catch(e:any) { showToast("❌ Bind Error: " + e.message); }
          setSimStatus("idle");
        }, ANIM_DURATION + 500);
      } else {
        showToast("❌ Animation failed: Target sensor has no deviceId mapped");
        setSimStatus("idle");
      }
    } catch (e: any) { showToast("❌ Error: " + e.message); setSimStatus("idle"); }
  };

  const enterVisitor = async () => {
    if (simStatus === "running") return;
    if (mapFree <= 0) {
      showToast("❌ Entry Denied: Parking lot is completely full!");
      return;
    }
    setSimStatus("running");
    try {
      const plateNumber = randomPlate();
      const vehicleType = randomVehicleType();
      const res = await apiCall("POST", "/api/cards/issue", { plateNumber, vehicleType });
      if (!res.success) { showToast("❌ No cards available"); setSimStatus("idle"); return; }
      showToast(`✅ ${plateNumber} (${vehicleType}) entered as visitor`);
      const targetDeviceId = startAnimation(res.data.sessionId, plateNumber, "#d97706", "gate", "sensor");
      if (targetDeviceId) {
        setTimeout(async () => {
          try {
            const bindRes = await apiCall("POST", "/api/monitoring/bind", { sessionId: res.data.sessionId, deviceId: targetDeviceId });
            if (!bindRes.success) showToast("❌ Target Binding Failed: " + bindRes.message);
          } catch(e:any) { showToast("❌ Bind Error: " + e.message); }
          setSimStatus("idle");
        }, ANIM_DURATION + 500);
      } else {
        showToast("❌ Animation failed: Target sensor has no deviceId mapped");
        setSimStatus("idle");
      }
    } catch (e: any) { showToast("❌ Error: " + e.message); setSimStatus("idle"); }
  };

  const exitUser = async () => {
    setSimStatus("running");
    try {
      const sessRes = await apiCall("GET", "/api/sessions");
      const active = sessRes.data?.filter((s: any) => s.sessionStatus === "ACTIVE") ?? [];
      const visible = active.filter((s: any) => s.deviceId);
      const pool = visible.length > 0 ? visible : active;
      if (pool.length === 0) { showToast("⚠️ No active sessions to exit"); setSimStatus("idle"); return; }
      
      const session = pool[Math.floor(Math.random() * pool.length)];

      // Reverse BFS: from sensor node → gate node
      const sensorNode = hardware.find(d => d.deviceId === session.deviceId && d.type === "sensor");
      const gateNode = hardware.find(d => d.type === "gate");

      let exitPath: { x: number; y: number }[];
      if (sensorNode && gateNode) {
        const reversePath = findPath(graph, hardware, sensorNode.id, "gate", null);
        exitPath = reversePath.length >= 2
          ? reversePath.map(d => ({ x: d.x, y: d.y }))
          : [{ x: sensorNode.x, y: sensorNode.y }, { x: gateNode.x, y: gateNode.y }];
      } else {
        exitPath = [{ x: 50, y: 50 }, { x: 50, y: 90 }];
      }

      setAgents(prev => [...prev, { id: session.sessionId + "_exit", path: exitPath, startTime: Date.now(), plateNumber: session.plateNumber, color: "#dc2626", direction: "EXIT" }]);
      
      // Call APIs after animation completes
      setTimeout(async () => {
        await apiCall("POST", "/api/gates/check-out", { sessionId: session.sessionId });
        if (session.type === "TEMPORARY") {
          await apiCall("POST", "/api/cards/return", { tempCardID: session.subjectID });
        }
        showToast(`✅ ${session.plateNumber} exited successfully`);
        setSimStatus("idle");
      }, ANIM_DURATION + 500);
    } catch (e: any) { showToast("❌ Error: " + e.message); setSimStatus("idle"); }

  };

  // BFS through connection graph from a start node, collecting all sensors in the zone
  const bfsReachableSensors = (startId: string): PlacedDevice[] => {
    const visited = new Set<string>([startId]);
    const queue = [startId];
    const found: PlacedDevice[] = [];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      // Follow outgoing connections only (directed: source → target)
      const targets = connections
        .filter(c => c.sourceId === nodeId)
        .map(c => layout.find(d => d.id === c.targetId))
        .filter((d): d is PlacedDevice => !!d && !visited.has(d.id));

      for (const t of targets) {
        visited.add(t.id);
        if (t.type === "sensor") found.push(t);
        else queue.push(t.id); // keep traversing through waypoints/entrances etc.
      }
    }
    return found;
  };

  // Signage info: branch-level zone slot availability via BFS
  const getSignageInfo = (signageId: string) => {
    const signage = layout.find(d => d.id === signageId);
    if (!signage) return [];
    
    const directTargets = connections
      .filter(c => c.sourceId === signageId)
      .map(c => layout.find(d => d.id === c.targetId))
      .filter(Boolean) as PlacedDevice[];

    return directTargets.map(target => {
      // Calculate geometric direction relative to signage
      let directionLabel = "TARGET";
      const angle = Math.atan2(target.y - signage.y, target.x - signage.x) * (180 / Math.PI);
      if (angle > -45 && angle <= 45)       directionLabel = "→ EAST";
      else if (angle > 45 && angle <= 135)  directionLabel = "↓ SOUTH";
      else if (angle > 135 || angle <= -135) directionLabel = "← WEST";
      else                                   directionLabel = "↑ NORTH";

      // BFS to collect all sensors reachable via this specific target path
      const zoneSensors = bfsReachableSensors(target.id);
      const totalSlots = zoneSensors.length;
      const freeSlots = zoneSensors.filter(s => {
        const color = getStatusColor(liveData, s.deviceId);
        return color === "#2563eb"; // idle = blue = free
      }).length;

      return { 
        targetName: target.label || target.type.toUpperCase(), 
        directionLabel, 
        totalSlots, 
        freeSlots 
      };
    });
  };

  const selectedDevice = layout.find(d => d.id === selectedId);
  const logLevelColor = (level: string) =>
    level === "SUCCESS" ? "text-green-400" : level === "ERROR" ? "text-red-400" : level === "WARNING" ? "text-amber-400" : "text-slate-300";
  const sourceTagColor = (source: string): string => {
    const map: Record<string, string> = {
      AUTH: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      HCMUT_SSO: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      SESSION: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      BILLING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      GATE: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      DB: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      CARD: "bg-green-500/20 text-green-300 border-green-500/30",
      SYSTEM: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    };
    return map[source] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 text-slate-900">
      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none bg-white"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onClick={() => setSelectedId(null)}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #003087 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Top bar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white shadow border border-slate-200 px-4 py-2 rounded-2xl">
            <Activity className={`h-3.5 w-3.5 ${connected ? "text-green-500 animate-pulse" : "text-red-400"}`} />
            <span className="text-xs font-bold text-slate-600">Live Monitoring</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {connected ? "SSE" : "OFF"}
            </span>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900 text-white text-sm px-4 py-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2">
            {toast}
          </div>
        )}

        {/* Traffic Simulation Box */}
        <div className="absolute top-4 right-4 z-10 bg-white shadow-lg border border-slate-200 rounded-2xl p-3 w-52">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Traffic Sim</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Enter Learner/Staff", color: "bg-blue-600 hover:bg-blue-700", action: enterStaff },
              { label: "Enter Visitor", color: "bg-amber-500 hover:bg-amber-600", action: enterVisitor },
              { label: "Exit User", color: "bg-red-500 hover:bg-red-600", action: exitUser },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} 
                disabled={simStatus === "running" || (btn.label.includes("Enter") && mapFree <= 0)}
                className={`w-full text-white text-[11px] font-bold py-2 px-3 rounded-xl transition-all ${btn.color} disabled:opacity-40 disabled:cursor-not-allowed`}>
                {simStatus === "running" && agents.length > 0 ? "Simulating..." : btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1">
          {[{l:"+", fn:()=>setScale(s=>Math.min(s*1.2,4))},{l:"−",fn:()=>setScale(s=>Math.max(s*0.8,0.15))},{l:"⊙",fn:()=>{setScale(0.55);setOffset({x:0,y:0});}}].map(b=>(
            <button key={b.l} onClick={b.fn} className="h-9 w-9 bg-white shadow border border-slate-200 rounded-xl text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 text-sm">{b.l}</button>
          ))}
        </div>

        {/* Global Layout Availability + Legend */}
        <div className="absolute top-[260px] right-4 z-10 flex flex-col gap-2">
          {/* Availability summary box — layout-aware: only sensors on this map */}
          <div className="bg-white shadow-lg border border-slate-200 rounded-2xl p-4 w-52">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Availability</span>
              <span className="text-[10px] text-slate-400">{mapTotalSlots} on map</span>
            </div>
            <p className="text-[9px] text-slate-300 mb-3">Sensors on this layout only</p>

            {mapTotalSlots > 0 ? (
              <>
                {/* Big free number */}
                <div className="text-center mb-3">
                  <span className={`text-4xl font-black ${
                    mapFree === 0         ? "text-red-500"   :
                    mapFree < mapTotalSlots * 0.3 ? "text-amber-500" :
                    "text-green-500"
                  }`}>{mapFree}</span>
                  <span className="text-slate-400 text-sm"> / {mapTotalSlots}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">slots available</p>
                </div>

                {/* Segmented progress bar: occupied | fault | free */}
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex mb-3">
                  <div className="bg-green-500 h-full transition-all duration-700"
                    style={{ width: `${(mapFree / mapTotalSlots) * 100}%` }}/>
                  <div className="bg-red-400 h-full transition-all duration-700"
                    style={{ width: `${(mapOccupied / mapTotalSlots) * 100}%` }}/>
                  {mapFault > 0 && (
                    <div className="bg-amber-400 h-full transition-all duration-700"
                      style={{ width: `${(mapFault / mapTotalSlots) * 100}%` }}/>
                  )}
                </div>

                {/* Counts row */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-green-600"><div className="h-2 w-2 rounded-full bg-green-500"/>Free</span>
                    <span className="font-bold text-green-600">{mapFree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-red-500"><div className="h-2 w-2 rounded-full bg-red-400"/>Occupied</span>
                    <span className="font-bold text-red-500">{mapOccupied}</span>
                  </div>
                  {mapFault > 0 && (
                    <div className="flex justify-between group relative cursor-help">
                      <span className="flex items-center gap-1.5 text-amber-500"><div className="h-2 w-2 rounded-full bg-amber-400"/>Fault</span>
                      <span className="font-bold text-amber-500">{mapFault}</span>
                      <div className="absolute hidden group-hover:block right-0 -top-16 bg-slate-800 text-white p-2 rounded text-[10px] w-44 z-50 text-center shadow-lg border border-slate-700">
                        Reflects real backend ERROR/OFFLINE hardware status.
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 text-xs py-4">
                {layout.length === 0 ? "Loading map..." : "No sensors on map"}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 bg-white shadow border border-slate-200 px-4 py-2 rounded-2xl justify-center">
            {[["#2563eb","Idle"],["#16a34a","Active"],["#ef4444","Fault"]].map(([c,l])=>(
              <div key={l} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:c}}/>
                <span className="text-[11px] text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        </div>


        {/* SVG Canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})`, transformOrigin:"center", pointerEvents:"all" }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="rounded-xl shadow-xl overflow-visible">
              <rect width={W} height={H} fill="#f8fafc" rx="12"/>
              {CAMPUS_PARKING_ALPHA.zones.map((z:any) => z.bounds && (
                <rect key={z.id} x={z.bounds.x} y={z.bounds.y} width={z.bounds.width} height={z.bounds.height} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" rx="6"/>
              ))}
              <defs>
                <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#3b82f6"/></marker>
                <marker id="arr-road" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#94a3b8"/></marker>
              </defs>

              {/* Roads */}
              {roads.map(d => d.points && d.points.length >= 2 && [
                <polyline key={d.id+"bg"} points={d.points.map(p=>`${px(p.x,W)},${px(p.y,H)}`).join(" ")} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>,
                <polyline key={d.id+"ln"} points={d.points.map(p=>`${px(p.x,W)},${px(p.y,H)}`).join(" ")} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 10" markerEnd="url(#arr-road)"/>
              ])}

              {/* User zones */}
              {zones.map(z => z.points && (
                <g key={z.id}>
                  <polygon points={z.points.map(p=>`${px(p.x,W)},${px(p.y,H)}`).join(" ")} fill="rgba(59,130,246,0.06)" stroke="#93c5fd" strokeWidth="2" strokeDasharray="6 4"/>
                  <text x={px(z.x,W)} y={px(z.y,H)} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">{z.label}</text>
                </g>
              ))}

              {/* Connections */}
              {connections.map(conn => {
                const s = layout.find(d=>d.id===conn.sourceId), t = layout.find(d=>d.id===conn.targetId);
                if (!s||!t) return null;
                return (
                  <g key={conn.id}>
                    <line x1={px(s.x,W)} y1={px(s.y,H)} x2={px(t.x,W)} y2={px(t.y,H)} stroke="transparent" strokeWidth="14"/>
                    <line x1={px(s.x,W)} y1={px(s.y,H)} x2={px(t.x,W)} y2={px(t.y,H)} stroke="#3b82f6" strokeWidth={t.type==="sensor"?1.5:2.5} strokeDasharray={t.type==="sensor"?"5 5":"0"} markerEnd="url(#arr)"/>
                  </g>
                );
              })}

              {/* Hardware icons */}
              {hardware.map(d => {
                const color = getStatusColor(liveData, d.deviceId);
                const isSel = selectedId === d.id;
                const cx = px(d.x,W), cy = px(d.y,H);
                const r = (d.type==="sensor"||d.type==="waypoint") ? 10 : 16;
                return (
                  <g key={d.id} style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSelectedId(d.id);}}>
                    {color==="#ef4444" && <circle cx={cx} cy={cy} r={r+8} fill="#ef4444" opacity="0.15"/>}
                    {isSel && <circle cx={cx} cy={cy} r={r+6} fill="none" stroke="#1d4ed8" strokeWidth="2" opacity="0.7"/>}
                    <circle cx={cx} cy={cy} r={r} fill={color+"18"} stroke={color} strokeWidth={isSel?2.5:1.5}/>
                    <text x={cx} y={cy+4} textAnchor="middle" fill={color} fontSize={r*0.9} fontWeight="bold">{ICON_CHARS[d.type]??"·"}</text>
                  </g>
                );
              })}


              {/* Vehicle agents */}
              {agents.map(agent => {
                const pos = interpolateAlongPath(agent.path, 0, W, H);
                return (
                  <g key={agent.id} id={`agent-${agent.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle cx={0} cy={0} r={11} fill={agent.color} stroke="white" strokeWidth="2.5" style={{filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.25))"}}/>
                    <text x={0} y={-16} textAnchor="middle" fill={agent.color} fontSize="9" fontWeight="bold"
                      style={{filter:"drop-shadow(0 1px 2px rgba(255,255,255,0.8))"}}>{agent.plateNumber}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col bg-white border-l border-slate-200 overflow-hidden">
        {selectedDevice ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Info className="h-3.5 w-3.5"/> Device</span>
              <button onClick={()=>setSelectedId(null)} className="text-slate-400 hover:text-slate-700"><ChevronRight className="h-4 w-4"/></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex flex-col items-center gap-3 py-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-4 bg-white rounded-full shadow ring-4 ring-slate-100">
                  <span style={{color:getStatusColor(liveData,selectedDevice.deviceId),fontSize:"28px"}}>{ICON_CHARS[selectedDevice.type]??"·"}</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">{selectedDevice.label||"Unlabeled"}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{selectedDevice.type}</p>
                </div>
              </div>
              {selectedDevice.type === "signage" ? (() => {
                const branches = getSignageInfo(selectedDevice.id);
                return (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex">Directional Routing</label>
                      {branches.map((b, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-slate-700">{b.targetName}</span>
                            <span className="text-[10px] font-black tracking-widest text-blue-500">{b.directionLabel}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white rounded-lg px-3 py-1.5 border border-slate-100 shadow-sm">
                            <span className="text-xs text-slate-500 font-mono">Free / Total</span>
                            <span className={`text-xs font-black ${b.freeSlots > 0 ? "text-green-600" : "text-red-500"}`}>
                              {b.freeSlots} / {b.totalSlots}
                            </span>
                          </div>
                        </div>
                      ))}
                      {branches.length === 0 && (
                        <div className="text-xs text-slate-400 italic">No targets mapped.</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IoT Binding</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono">{selectedDevice.deviceId||"Unbound"}</div>
                    </div>
                  </>
                );
              })() : (
                [
                  ["Status", (() => { const c=getStatusColor(liveData,selectedDevice.deviceId); return c==="#16a34a"?"Occupied":c==="#ef4444"?"Fault":"Idle/Online"; })()],
                  ["IoT Binding", selectedDevice.deviceId||"Unbound"],
                  ["Position", `X:${selectedDevice.x.toFixed(1)}%  Y:${selectedDevice.y.toFixed(1)}%`],
                  ["Connections", String(connections.filter(c=>c.sourceId===selectedDevice.id||c.targetId===selectedDevice.id).length)],
                ].map(([k,v])=>(
                  <div key={k} className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k}</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-mono">{v}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Terminal className="h-3.5 w-3.5"/> System Log</span>
              <Activity className={`h-3.5 w-3.5 ${connected?"text-green-500 animate-pulse":"text-slate-300"}`}/>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-900">
              <div className="p-3 space-y-0.5 font-mono text-[11px]">
                {logs.length === 0 && (
                  <div className="text-slate-500 italic p-2">Waiting for events...</div>
                )}
                {logs.map((log, i) => (
                  <div key={log.logId ?? i} className="px-2 py-1.5 rounded hover:bg-white/5 cursor-default border-b border-white/5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-slate-600 flex items-center gap-0.5 shrink-0">
                        <Clock className="h-2.5 w-2.5"/>
                        {new Date(log.timestamp).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${sourceTagColor(log.source)}`}>
                        {log.source}
                      </span>
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        log.level === "SUCCESS" ? "bg-green-400" : log.level === "ERROR" ? "bg-red-400" : log.level === "WARNING" ? "bg-amber-400" : "bg-blue-400"
                      }`}/>
                    </div>
                    <p className={`leading-relaxed pl-0.5 ${logLevelColor(log.level)}`}>{log.message}</p>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-2 py-2 text-blue-400/50">
                  <span>▸</span><div className="w-1.5 h-3.5 bg-blue-400 animate-pulse rounded-sm"/>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500"/>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Alerts</span>
                {liveData?.alerts.length ? <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{liveData.alerts.length}</span> : null}
              </div>
              {liveData?.alerts.slice(0,2).map((a:any)=>(
                <div key={a.id} className="text-[11px] text-red-700 bg-red-50 rounded-lg px-2 py-1.5 mb-1 border border-red-100">{a.message}</div>
              ))}
              {!liveData?.alerts.length && <p className="text-[11px] text-slate-400 italic">No active alerts</p>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
