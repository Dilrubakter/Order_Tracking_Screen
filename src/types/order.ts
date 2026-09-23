/** The four delivery statuses the carrier pipeline reports, in order. */
export type DeliveryStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

export const DELIVERY_STEPS: readonly DeliveryStatus[] = [
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;

/** ISO-8601 timestamp string. */
export type IsoDateTime = string;

export interface TimeWindow {
  start: IsoDateTime;
  end: IsoDateTime;
}

export interface Money {
  amount: number;
  currency: 'BDT';
}

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: Money;
  /** Product photo URL (bundled asset in the mock data). */
  image: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  /** Area / thana, e.g. "Banani". */
  area: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Carrier {
  name: string;
  trackingNumber: string;
}

export interface ScanEvent {
  id: string;
  description: string;
  timestamp: IsoDateTime;
  location?: string;
}

export interface DelayInfo {
  reportedAt: IsoDateTime;
  reason: string;
  lastScanLocation: string;
  /** The ETA the customer was originally promised. */
  originalEta: TimeWindow;
}

export interface ProofOfDelivery {
  deliveredAt: IsoDateTime;
  location: string;
  hasPhoto: boolean;
  signatureRequired: boolean;
}

export type SupportCaseStatus = 'investigating' | 'resolved';

export interface SupportCase {
  id: string;
  openedAt: IsoDateTime;
  status: SupportCaseStatus;
  /** When the customer should expect the next update. */
  nextUpdateBy: IsoDateTime;
}

export type RefundChoice = 'cancel_and_refund' | 'keep_with_credit';

export interface RefundRequest {
  id: string;
  choice: RefundChoice;
  requestedAt: IsoDateTime;
}

export interface Tracking {
  status: DeliveryStatus;
  /** Timestamp at which each reached step was completed/entered. */
  stepTimes: Partial<Record<DeliveryStatus, IsoDateTime>>;
  /** Current estimate; `null` when the carrier has not provided a new one. */
  eta: TimeWindow | null;
  delay?: DelayInfo;
  /** True when the order exists but the carrier hasn't scanned the parcel yet. */
  awaitingCarrier: boolean;
  scans: ScanEvent[];
  proof?: ProofOfDelivery;
  missingReport?: SupportCase;
  refund?: RefundRequest;
  refundEligible: boolean;
  notifyOnShip: boolean;
  lastUpdated: IsoDateTime;
}

export interface Order {
  id: string;
  placedAt: IsoDateTime;
  items: OrderItem[];
  shippingCost: Money;
  total: Money;
  shippingAddress: ShippingAddress;
  /** Where refunds go, already masked for display, e.g. "bKash •• 678". */
  paymentMethod: string;
  carrier: Carrier | null;
  tracking: Tracking;
}
