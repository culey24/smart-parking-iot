/** Random plate number generator */
export function randomPlate(): string {
  const prefixes = ["29A", "30F", "51G", "43H", "92C", "36A", "47B"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${num}`;
}

/** Random vehicle type */
export function randomVehicleType(): "MOTORBIKE" | "CAR" | "BICYCLE" {
  return (["MOTORBIKE", "CAR", "BICYCLE"] as const)[Math.floor(Math.random() * 3)];
}

/** Random seeded user schoolCardId pool */
export const SEEDED_SCHOOL_CARD_IDS = Array.from({ length: 20 }, (_, i) =>
  String(100001 + i)
);
