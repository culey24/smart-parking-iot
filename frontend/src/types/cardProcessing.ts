export type CardStatus = "Active" | "Disabled";

export interface CardLookupResult {
  vehicleType: string;
  licensePlate: string;
  session: {
    entryTime: string;
    platePhotoUrl?: string | null;
  };
  linkedCard: {
    lastFourDigits: string;
    status: CardStatus;
  };
}
