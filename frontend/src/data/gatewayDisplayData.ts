/**
 * Mock data cho màn hình hiển thị tại gateway (lối vào/ra bãi xe).
 * Khi xe ra: quét thẻ → hiển thị 2 bên:
 * - Trái: thông tin phiên lúc xe vào
 * - Phải: biển số + mặt người xe ra
 */

export type GateDirection = "entry" | "exit";

/** Thông tin phiên đỗ xe lúc xe vào (dùng cho cổng ra) */
export interface EntrySessionInfo {
  entryTime: string;
  licensePlate: string;
  entryGateLabel: string;
  durationMinutes?: number;
  licensePlateImageUrl: string;  // Ảnh biển số lúc vào
  driverFaceImageUrl: string;    // Ảnh khuôn mặt lúc vào
}

export interface GatewayDisplayItem {
  gateId: string;
  gateLabel: string;
  direction: GateDirection;
  licensePlate: string;
  licensePlateImageUrl: string;
  driverFaceImageUrl: string;
  timestamp: string;
  barrierStatus: "open" | "closed";
  /** Chỉ có khi direction === "exit" – thông tin phiên lúc xe vào (từ thẻ quét) */
  entrySession?: EntrySessionInfo;
}

// Placeholder URLs - thay bằng URL thật khi tích hợp camera/API (màu sáng phù hợp theme)
const PLATE_PLACEHOLDER = "https://placehold.co/360x100/e2e8f0/64748b?text=LICENSE+PLATE";
const FACE_PLACEHOLDER = "https://placehold.co/140x180/e2e8f0/64748b?text=DRIVER+FACE";

export const GATEWAY_DISPLAY_ITEMS: GatewayDisplayItem[] = [
  {
    gateId: "gate-a-entry",
    gateLabel: "Cổng A - Vào",
    direction: "entry",
    licensePlate: "30A-12345",
    licensePlateImageUrl: PLATE_PLACEHOLDER,
    driverFaceImageUrl: FACE_PLACEHOLDER,
    timestamp: new Date().toISOString(),
    barrierStatus: "closed",
  },
  {
    gateId: "gate-a-exit",
    gateLabel: "Cổng A - Ra",
    direction: "exit",
    licensePlate: "51B-67890",
    licensePlateImageUrl: PLATE_PLACEHOLDER,
    driverFaceImageUrl: FACE_PLACEHOLDER,
    timestamp: new Date().toISOString(),
    barrierStatus: "open",
    entrySession: {
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      licensePlate: "51B-67890",
      entryGateLabel: "Cổng A - Vào",
      durationMinutes: 120,
      licensePlateImageUrl: PLATE_PLACEHOLDER,
      driverFaceImageUrl: FACE_PLACEHOLDER,
    },
  },
  {
    gateId: "gate-b-entry",
    gateLabel: "Cổng B - Vào",
    direction: "entry",
    licensePlate: "—",
    licensePlateImageUrl: PLATE_PLACEHOLDER,
    driverFaceImageUrl: FACE_PLACEHOLDER,
    timestamp: new Date().toISOString(),
    barrierStatus: "closed",
  },
  {
    gateId: "gate-b-exit",
    gateLabel: "Cổng B - Ra",
    direction: "exit",
    licensePlate: "59A-11111",
    licensePlateImageUrl: PLATE_PLACEHOLDER,
    driverFaceImageUrl: FACE_PLACEHOLDER,
    timestamp: new Date().toISOString(),
    barrierStatus: "closed",
    entrySession: {
      entryTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      licensePlate: "59A-11111",
      entryGateLabel: "Cổng B - Vào",
      durationMinutes: 45,
      licensePlateImageUrl: PLATE_PLACEHOLDER,
      driverFaceImageUrl: FACE_PLACEHOLDER,
    },
  },
];
