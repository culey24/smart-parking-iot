# Smart Parking Traffic & Guidance Logic

This document outlines the technical implementation of the traffic simulation, spatial intelligence, and automated guidance systems within the Smart Parking IoT suite.

## 1. Architectural Foundation

### Data Model (`parkingMapData.ts`)
- `ParkingMap`: top-level container with `mapName`, `dimensions` (px), and `zones[]`
- `ParkingZone`: structural zone with either `bounds` (rectangle) or `path` (polygon), optional `slots[]` for modular layouts, and `type` enum: `VERTICAL_STORAGE | MODULAR_SLOTS | OPEN_PARKING | CUSTOM_ZONE | GATEWAY`
- `CAMPUS_PARKING_ALPHA`: static map definition (920×1120px) with 6 zones — top chimney, left sidebar blocks, two central open blocks, angled wedge, main gateway

### Coordinate System
- Map dimensions: **pixel-based** (920×1120px)
- Device positions: **percentage-based** (x/y as 0-100% of canvas)
- Conversion: `sensorPx = (percent / 100) * canvasDimension`
- `mapGeometry.ts` handles the conversion for spatial queries

## 2. Layout Mapping Types (`layoutMapping.ts`)

### `MappedDeviceType`
```ts
"sensor" | "gateway" | "signage" | "barrier" | "entrance" | "exit" | "zone" | "road" | "waypoint"
```

### `PlacedDevice`
Core data structure for every element on the canvas:
- `id`: unique identifier (e.g. `SEN-123`, `ZONE-456`)
- `type`: one of `MappedDeviceType`
- `x`, `y`: percentage-based position
- `width`, `height`: for rectangular zones
- `points[]`: for polygon zones and multi-segment roads (percentage-based)
- `shape`: `"rectangle" | "polygon"`
- `label`: display name
- `connections[]`: IDs of connected devices (for traffic flow graph)
- `parentId`: hierarchical link (e.g. `entrance` → parent `zone`)

### `CanvasTransform`
Tracks pan/zoom state: `{ scale, offsetX, offsetY }`

## 3. Spatial Engine (`mapGeometry.ts`)

### `isSensorInZone(sensor, zone, mapDimensions)`
Rectangle hit-test. Converts sensor % to px, checks if within `zone.bounds`.

### `isPointInPolygon(point, polygon)`
Ray-casting algorithm. Works with percentage-based points.

### `getRectPoints(p1, p2)`
Generates 4-corner rectangle from two opposite drag corners.

### `calculateZoneOccupancy(map, placedDevices, sensorStates)`
Aggregates occupancy per zone by:
1. Querying `ParkingZone` bounds → count sensors inside via `isSensorInZone`
2. Querying user-drawn `PlacedDevice` zones (type=`zone`) → count sensors inside via `isPointInPolygon`
3. Cross-referencing sensor IDs with live `sensorStates[]`

Returns `Record<zoneId, { occupied, total, label }>`.

## 4. Layout Mapping Page (`LayoutMappingPage.tsx`)

### State
- `placedDevices[]`: all canvas elements (synced to localStorage key `parking_layout_mapping`)
- `mode`: `"select" | "connect" | "delete" | "pan" | "draw-rect" | "draw-tri"`
- `transform`: `{ scale, offsetX, offsetY }` for pan/zoom
- `connectionSource`: first device selected in connect mode
- `drawingPoints[]`: in-progress polygon vertices

### Device Palette
8 palette items:
| Type | Icon | Color |
|------|------|-------|
| `zone` (rect) | SquareIcon | slate-500 |
| `zone` (tri) | Triangle | slate-400 |
| `sensor` | Gauge | blue-500 |
| `gateway` | Radio | purple-500 |
| `signage` | Monitor | cyan-500 |
| `barrier` | Square | red-500 |
| `road` | RoadIcon | slate-700 |
| `waypoint` | Circle | slate-400 |

> Note: `entrance` and `exit` types are defined but **not yet** in the palette.

### Canvas Interactions
- **Drag from palette** → drops device at cursor position (mode-dependent: immediate for hardware, enters draw mode for zones)
- **Click canvas** → deselects
- **Space + drag OR middle mouse** → pan
- **Ctrl+scroll** → zoom (0.2×–5×)
- **Delete/Backspace** → removes selected device or connection
- **Draw mode** → click to place vertices; 2 clicks = rectangle, 3 clicks = triangle

### Zone Drawing Flow
1. Drag "Zone (Rect/Tri)" from palette → enters draw mode → cursor becomes crosshair
2. Click to place vertices (2 for rect, 3 for tri)
3. On finalize: creates `PlacedDevice` (type=`zone`) + auto-spawns a child `entrance` device with `parentId` set
4. Zone rendered as dashed SVG polygon overlay

### Connection Flow
1. Toggle connect mode → click source device (pulses blue)
2. Click target device → adds `connections[]` entry to source
3. Renders as SVG arrow line (thicker for non-slot targets, dashed for slot targets)
4. Click connection line to select/delete it

### Signage Direction Logic
`getSignageDirections(d)`:
- For each `connection` in a `signage` device, computes `atan2` angle to target
- Generates display message based on target type:
  - `signage` → "NEXT INTERSECTION"
  - `entrance` → "ZONE ENTRANCE"
  - `sensor` → "SLOT GUIDANCE"
- Labels rendered above the signage icon as floating badges

### Persistence
- `saveLayout()`: writes `placedDevices` to `localStorage` under `parking_layout_mapping` key
- On mount: reads from localStorage to restore state
- "Publish Changes" button fires `saveLayout()` + confirmation alert

### Right Panel (Property Inspector)
When a device is selected:
- Editable label input
- Read-only X/Y position display (% coords)
- Delete button

When a connection is selected:
- Shows `from` and `to` device IDs
- Remove connection button

## 5. Traffic Road Network

- **Road Components**: Thick solid lines with center lane markings (`stroke-dasharray="10 10"`) for physical vehicle pathways
- **Waypoints**: Non-hardware anchors for defining complex curves or intersections
- **Directional Vectors**: All road segments are directed, using SVG markers for allowed traffic flow

## 6. Smart Signage Intelligence

Signage components are context-aware and automatically calculate their display logic based on network topology:

- **Direction Detection**: Signages calculate the `atan2` angle between their position and the next connected node
- **Message Generation**:
  - `signage` → `signage`: "NEXT INTERSECTION"
  - `signage` → `entrance`: "ZONE ENTRANCE"
  - `signage` → `sensor`: "SLOT GUIDANCE"

## 7. High-Fidelity Slot Guidance

- **Implementation**: Traffic roads or waypoints connect directly to `sensor` components
- **Dynamic Color Coding**:
  - **Solid line**: Primary traffic road (target is not a sensor)
  - **Dashed line** (sensor target): Slot guidance path
- **Visual Distinction**: Slot guidance uses thinner stroke (`strokeWidth="2"`) and dash patterns (`"4 4"`) to distinguish from primary roads

## 8. Limitations & TODOs

- [ ] `entrance` and `exit` types not in `DEVICE_PALETTE` — no way to place them via UI
- [ ] No backend sync — layout persists only in browser localStorage; need `POST /api/layout/mapping`
- [ ] No real IoT device binding — `PlacedDevice` has no `deviceId` field linking to `IoTDevice` model
- [ ] No zone → `ParkingZone` model binding — user-drawn zones have no link to structural zones
- [ ] No undo/redo — layout edits are permanent per save
- [ ] `nextId` uses `Date.now()` — resets on hot reload, not UUID
- [ ] `connections[]` is unidirectional only — no reverse lookup

## 9. Planned Traffic Simulation Engine

1. **Entry Trigger**: Vehicle enters via `MAIN_GATEWAY`
2. **Pathfinding**: System identifies nearest available zone via occupancy queries
3. **Guidance Injection**: Signages along the path update to point toward target `entrance`
4. **Final Approach**: Slot guidance vectors lead to specific `sensor` ID
