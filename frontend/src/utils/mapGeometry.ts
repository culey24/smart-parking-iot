import type { PlacedDevice, MappedDeviceType } from "../types/layoutMapping";
import type { ParkingMap, ParkingZone } from "../data/parkingMapData";

/**
 * Checks if a point (in percentage) is within a zone's structural bounds (in pixels).
 */
export function isSensorInZone(
  sensor: { x: number; y: number },
  zone: ParkingZone,
  mapDimensions: { width: number; height: number }
): boolean {
  if (!zone.bounds) return false;

  const sensorPxX = (sensor.x / 100) * mapDimensions.width;
  const sensorPxY = (sensor.y / 100) * mapDimensions.height;

  const { x, y, width, height } = zone.bounds;

  return (
    sensorPxX >= x &&
    sensorPxX <= x + width &&
    sensorPxY >= y &&
    sensorPxY <= y + height
  );
}

/**
 * Checks if a point (in percentage) is within a polygon defined by vertices (in percentage).
 */
export function isPointInPolygon(point: {x: number, y: number}, polygon: {x: number, y: number}[]) {
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x, yi = polygon[i].y;
    let xj = polygon[j].x, yj = polygon[j].y;
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Finds the closest point on the perimeter of a polygon.
 */
export function getClosestPointOnPolygonPerimeter(point: {x: number, y: number}, polygon: {x: number, y: number}[]) {
  let minDistance = Infinity;
  let closestPoint = { x: point.x, y: point.y };

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];

    const closest = getClosestPointOnSegment(point, p1, p2);
    const dist = Math.sqrt(Math.pow(point.x - closest.x, 2) + Math.pow(point.y - closest.y, 2));

    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = closest;
    }
  }

  return closestPoint;
}

function getClosestPointOnSegment(p: {x: number, y: number}, a: {x: number, y: number}, b: {x: number, y: number}) {
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const lenSq = atob.x * atob.x + atob.y * atob.y;
  let dot = atop.x * atob.x + atop.y * atob.y;
  let t = Math.max(0, Math.min(1, dot / lenSq));
  return { x: a.x + atob.x * t, y: a.y + atob.y * t };
}

/**
 * Generates an orthogonal (right-angled) path through multiple points.
 */
export function getOrthogonalPath(points: {x: number, y: number}[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];
    
    // Calculate a midpoint that preserves right angles
    const midX = p1.x + (p2.x - p1.x) / 2;
    d += ` L ${midX},${p1.y} L ${midX},${p2.y} L ${p2.x},${p2.y}`;
  }
  
  return d;
}

/**
 * Generates 4 vertices for a rectangle from two opposite corners.
 */
export function getRectPoints(p1: {x: number, y: number}, p2: {x: number, y: number}) {
  return [
    { x: p1.x, y: p1.y },
    { x: p2.x, y: p1.y },
    { x: p2.x, y: p2.y },
    { x: p1.x, y: p2.y },
  ];
}

/**
 * Calculates real-time occupancy counts for each zone.
 */
export function calculateZoneOccupancy(
  map: ParkingMap,
  placedDevices: PlacedDevice[],
  sensorStates: { id: string; status: string }[]
) {
  const zoneCounts: Record<string, { occupied: number; total: number; label: string }> = {};

  map.zones.forEach(zone => {
    const sensorsInZone = placedDevices.filter(d => 
      d.type === ("sensor" as MappedDeviceType) && 
      isSensorInZone({ x: d.x, y: d.y }, zone, map.dimensions)
    );
    const occupiedCount = sensorsInZone.filter(s => {
      const state = sensorStates.find(st => st.id === s.id || (s.deviceId && st.id === s.deviceId));
      return state?.status === "OCCUPIED";
    }).length;
    zoneCounts[zone.id] = { occupied: occupiedCount, total: sensorsInZone.length, label: zone.id };
  });

  placedDevices.filter(d => d.type === ("zone" as MappedDeviceType)).forEach(zone => {
    if (!zone.points) return;
    const sensorsInZone = placedDevices.filter(d => 
      d.type === ("sensor" as MappedDeviceType) && 
      isPointInPolygon({ x: d.x, y: d.y }, zone.points!)
    );
    const occupiedCount = sensorsInZone.filter(s => {
      const state = sensorStates.find(st => st.id === s.id || (s.deviceId && st.id === s.deviceId));
      return state?.status === "OCCUPIED";
    }).length;
    zoneCounts[zone.id] = { occupied: occupiedCount, total: sensorsInZone.length, label: zone.label || zone.id };
  });

  return zoneCounts;
}
