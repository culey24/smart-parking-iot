import { useEffect, useState } from "react";
import { API_BASE, TOKEN_KEY } from "@/config/api";
import type { MonitoringData } from "@/types/monitoring";

export interface SystemLogEntry {
  logId: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  source: string;
  message: string;
  sessionId?: string;
  deviceId?: string;
}

export interface VehicleEvent {
  event: "ENTER" | "EXIT";
  sessionId: string;
  plateNumber: string;
  userType: "REGISTERED" | "TEMPORARY";
  path: { x: number; y: number }[]; // % coordinates
}

export function useMonitoringSSE() {
  const [liveData, setLiveData] = useState<MonitoringData | null>(null);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [vehicleQueue, setVehicleQueue] = useState<VehicleEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const url = `${API_BASE}/api/monitoring/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "snapshot") setLiveData(msg.data);
        if (msg.type === "log") setLogs((prev) => {
          // Deduplicate: skip if logId already present
          if (prev.some(l => l.logId === msg.data.logId)) return prev;
          return [msg.data, ...prev].slice(0, 50);
        });
        if (msg.type === "vehicle") setVehicleQueue((prev) => [...prev, msg.data]);
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, []);

  const dequeueVehicle = () =>
    setVehicleQueue((prev) => prev.slice(1));

  return { liveData, logs, vehicleQueue, dequeueVehicle, connected };
}
