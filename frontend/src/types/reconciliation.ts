/** Fee reconciliation – UC 3.6 report issues */

export type ReconciliationStatus = "pending" | "confirmed" | "refunded" | "adjusted";

export interface ReconciliationRequest {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  licensePlate: string;
  reportedAt: string;
  description: string;
  status: ReconciliationStatus;
}

export interface SpmsData {
  entryTime: string;
  exitTime: string;
  licensePlate: string;
  cardId: string;
  calculatedAmount: number;
}

export interface BkpayData {
  transactionId: string;
  transactionStatus: string;
  actualAmount: number;
}

export interface RelatedSession {
  id: string;
  entryTime: string;
  exitTime: string;
  licensePlate: string;
  fee: number;
}
