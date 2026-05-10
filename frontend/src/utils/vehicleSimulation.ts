import type { PlacedDevice } from "@/types/layoutMapping";
import type { MonitoringData } from "@/types/monitoring";

export interface VehicleAgent {
  id: string;              // sessionId
  path: { x: number; y: number }[]; // % positions along the route
  startTime: number;       // Date.now() timestamp
  plateNumber: string;
  color: string;           // hex
  direction: "ENTER" | "EXIT";
}

/** Build an adjacency list from connections in the layout */
export function buildGraph(devices: PlacedDevice[], connections: PlacedDevice[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const d of devices) {
    if (d.type !== "connection") graph.set(d.id, []);
  }
  for (const c of connections) {
    if (c.type !== "connection" || !c.sourceId || !c.targetId) continue;
    if (graph.has(c.sourceId)) graph.get(c.sourceId)!.push(c.targetId);
    if (graph.has(c.targetId)) graph.get(c.targetId)!.push(c.sourceId); // bidirectional for exit
  }
  return graph;
}

/**
 * BFS from startId to first device matching targetType that is idle (not occupied).
 * Returns ordered list of PlacedDevices (the path).
 */
export function findPath(
  graph: Map<string, string[]>,
  devices: PlacedDevice[],
  startId: string,
  targetType: string,
  liveData: MonitoringData | null
): PlacedDevice[] {
  const visited = new Set<string>();
  const queue: string[][] = [[startId]];
  visited.add(startId);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const nodeId = path[path.length - 1];
    const node = devices.find((d) => d.id === nodeId);
    if (!node) continue;

    if (node.type === targetType && nodeId !== startId) {
      // Check if idle (not occupied in live data)
      if (liveData && node.deviceId) {
        const dev = liveData.devices.find((d: any) => d.id === node.deviceId);
        if (dev?.status === "occupied" || dev?.status === "error" || dev?.status === "offline") {
          // Skip occupied sensors
        } else {
          return path.map((id) => devices.find((d) => d.id === id)!).filter(Boolean);
        }
      } else {
        return path.map((id) => devices.find((d) => d.id === id)!).filter(Boolean);
      }
    }

    for (const neighbor of graph.get(nodeId) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return []; // no path found
}

/**
 * Smoothly interpolate a position along a multi-segment path.
 * @param path Array of {x, y} in percentage coords
 * @param progress 0–1
 * @param W canvas width in px
 * @param H canvas height in px
 */
export function interpolateAlongPath(
  path: { x: number; y: number }[],
  progress: number,
  W: number,
  H: number
): { x: number; y: number } {
  if (path.length === 0) return { x: 0, y: 0 };
  if (path.length === 1) return { x: (path[0].x / 100) * W, y: (path[0].y / 100) * H };

  // Calculate total path length
  const pxPoints = path.map((p) => ({ x: (p.x / 100) * W, y: (p.y / 100) * H }));
  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 1; i < pxPoints.length; i++) {
    const dx = pxPoints[i].x - pxPoints[i - 1].x;
    const dy = pxPoints[i].y - pxPoints[i - 1].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    lengths.push(len);
    totalLength += len;
  }

  const targetDist = progress * totalLength;
  let walked = 0;
  for (let i = 0; i < lengths.length; i++) {
    if (walked + lengths[i] >= targetDist) {
      const t = (targetDist - walked) / lengths[i];
      return {
        x: pxPoints[i].x + t * (pxPoints[i + 1].x - pxPoints[i].x),
        y: pxPoints[i].y + t * (pxPoints[i + 1].y - pxPoints[i].y),
      };
    }
    walked += lengths[i];
  }
  return pxPoints[pxPoints.length - 1];
}
