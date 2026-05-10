export interface ParkingZone {
  id: string;
  type?: string;
  description?: string;
  bounds?: { x: number; y: number; width: number; height: number };
  slots?: { id: string; relX: number; relY: number; w: number; h: number }[];
  blocks?: { id: string; x: number; y: number; w: number; h: number }[];
  path?: number[][];
  isAngled?: boolean;
}

export interface ParkingMap {
  mapName: string;
  dimensions: { width: number; height: number; unit: string };
  zones: ParkingZone[];
}

export const CAMPUS_PARKING_ALPHA: ParkingMap = {
  mapName: 'Campus_Parking_Alpha',
  // "Fit Mode" dimensions calculated from the min/max X and Y of all elements below
  dimensions: { width: 920, height: 1120, unit: 'px' },
  zones: [
    // 1. TOP VERTICAL BLOCK (The "Chimney" shape at the top left)
    {
      id: 'ZONE_TOP_NORTH',
      type: 'VERTICAL_STORAGE',
      bounds: { x: 200, y: 20, width: 150, height: 300 },
      slots: [{ id: 'N01', relX: 10, relY: 10, w: 130, h: 280 }],
    },
    // 2. LEFT SIDEBAR BLOCKS
    {
      id: 'ZONE_WEST_MODULAR',
      type: 'MODULAR_SLOTS',
      bounds: { x: 20, y: 350, width: 160, height: 550 },
      slots: [
        { id: 'W01', relX: 0, relY: 0, w: 160, h: 260 },
        { id: 'W02', relX: 0, relY: 290, w: 160, h: 260 },
      ],
    },
    // 3A. CENTRAL BLOCK (TOP) - Aligned with W01
    {
      id: 'ZONE_CENTRAL_TOP',
      type: 'OPEN_PARKING',
      bounds: { x: 350, y: 350, width: 550, height: 260 },
    },
    // 3B. CENTRAL BLOCK (BOTTOM) - Aligned with W02
    {
      id: 'ZONE_CENTRAL_BOTTOM',
      type: 'OPEN_PARKING',
      bounds: { x: 350, y: 640, width: 550, height: 260 },
    },
    // 4. THE ANGLED TOP-RIGHT (The custom "wedge" shape)
    {
      id: 'ZONE_EAST_ANGLED',
      type: 'CUSTOM_ZONE',
      path: [
        [350, 300],
        [900, 150],
        [900, 300],
        [600, 300],
      ],
      isAngled: true,
    },
    // 5. THE BOTTOM ENTRANCE
    {
      id: 'MAIN_GATEWAY',
      type: 'GATEWAY',
      bounds: { x: 220, y: 1000, width: 150, height: 100 },
    },
  ],
};
