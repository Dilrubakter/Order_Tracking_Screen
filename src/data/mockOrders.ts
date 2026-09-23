import sockImage from '@/assets/products/socks.svg';
import sweaterImage from '@/assets/products/sweater.svg';
import toteImage from '@/assets/products/tote.svg';
import type { Order, OrderItem, ScanEvent, ShippingAddress } from '@/types/order';

/**
 * Static fixtures. Every scenario uses the SAME order (#ORD-48213) so the UI
 * can be compared across states. Times are Bangladesh Standard Time (UTC+6); money is in taka (BDT).
 */

export const DEMO_ORDER_ID = 'ORD-48213';

const bdt = (amount: number) => ({ amount, currency: 'BDT' as const });

const ITEMS: OrderItem[] = [
  {
    id: 'itm-1',
    name: 'Everyday Merino Crewneck Sweater – Relaxed Fit Heavyweight Knit',
    variant: 'Oat · Size M',
    quantity: 1,
    price: bdt(4500),
    image: sweaterImage,
  },
  {
    id: 'itm-2',
    name: 'Canvas Weekender Tote',
    variant: 'Natural · One size',
    quantity: 1,
    price: bdt(2400),
    image: toteImage,
  },
  {
    id: 'itm-3',
    name: 'Organic Cotton Crew Socks, 3-Pack',
    variant: 'Heather grey · Size M',
    quantity: 1,
    price: bdt(950),
    image: sockImage,
  },
];

const ADDRESS: ShippingAddress = {
  name: 'Nusrat Jahan',
  line1: 'House 12, Road 5',
  line2: 'Block C',
  area: 'Banani',
  city: 'Dhaka',
  postalCode: '1213',
  country: 'Bangladesh',
  phone: '+880 1712-345678',
};

const CARRIER = { name: 'Padma Express', trackingNumber: 'PDX739422105836' };

const baseOrder = (placedAt: string): Omit<Order, 'tracking' | 'carrier'> => ({
  id: DEMO_ORDER_ID,
  placedAt,
  items: ITEMS,
  shippingCost: bdt(120),
  total: bdt(7970),
  shippingAddress: ADDRESS,
  paymentMethod: 'bKash •• 678',
});

const scan = (id: string, description: string, timestamp: string, location?: string): ScanEvent => ({
  id,
  description,
  timestamp,
  location,
});

const TRANSIT_SCANS: ScanEvent[] = [
  scan('s6', 'Out for delivery', '2024-09-26T07:52:00+06:00', 'Banani Delivery Hub, Dhaka'),
  scan('s5', 'Arrived at delivery hub', '2024-09-26T05:10:00+06:00', 'Banani Delivery Hub, Dhaka'),
  scan('s4', 'Departed sort centre', '2024-09-25T23:36:00+06:00', 'Tejgaon Central Hub, Dhaka'),
  scan('s3', 'Arrived at sort centre', '2024-09-25T18:02:00+06:00', 'Tejgaon Central Hub, Dhaka'),
  scan('s2', 'Picked up by courier', '2024-09-24T15:18:00+06:00', 'Chattogram Fulfilment Centre'),
  scan('s1', 'Shipping label created', '2024-09-24T09:04:00+06:00'),
];

const ETA_THU = { start: '2024-09-26T14:00:00+06:00', end: '2024-09-26T18:00:00+06:00' };

export function outForDeliveryOrder(): Order {
  return {
    ...baseOrder('2024-09-23T09:41:00+06:00'),
    carrier: CARRIER,
    tracking: {
      status: 'out_for_delivery',
      stepTimes: {
        processing: '2024-09-23T09:41:00+06:00',
        shipped: '2024-09-24T15:18:00+06:00',
        out_for_delivery: '2024-09-26T07:52:00+06:00',
      },
      eta: ETA_THU,
      awaitingCarrier: false,
      scans: TRANSIT_SCANS,
      refundEligible: false,
      notifyOnShip: true,
      lastUpdated: '2024-09-26T08:05:00+06:00',
    },
  };
}

export function delayedOrder({ newEtaKnown }: { newEtaKnown: boolean }): Order {
  return {
    ...baseOrder('2024-09-18T09:41:00+06:00'),
    carrier: CARRIER,
    tracking: {
      status: 'shipped',
      stepTimes: {
        processing: '2024-09-18T09:41:00+06:00',
        shipped: '2024-09-19T15:18:00+06:00',
      },
      eta: newEtaKnown ? ETA_THU : null,
      delay: {
        reportedAt: '2024-09-22T18:05:00+06:00',
        reason: 'The carrier reported a delay in transit.',
        lastScanLocation: 'Cumilla Sort Hub',
        originalEta: { start: '2024-09-23T14:00:00+06:00', end: '2024-09-23T18:00:00+06:00' },
      },
      awaitingCarrier: false,
      scans: [
        scan('d5', 'Delay in transit reported', '2024-09-22T18:05:00+06:00', 'Cumilla Sort Hub'),
        scan('d4', 'Arrived at sort hub', '2024-09-21T14:40:00+06:00', 'Cumilla Sort Hub'),
        scan('d3', 'Departed transit point', '2024-09-20T22:12:00+06:00', 'Feni Transit Point'),
        scan('d2', 'Picked up by courier', '2024-09-19T15:18:00+06:00', 'Chattogram Fulfilment Centre'),
        scan('d1', 'Shipping label created', '2024-09-19T09:02:00+06:00'),
      ],
      refundEligible: true,
      notifyOnShip: true,
      lastUpdated: '2024-09-24T10:12:00+06:00',
    },
  };
}

export function deliveredOrder(): Order {
  return {
    ...baseOrder('2024-09-23T09:41:00+06:00'),
    carrier: CARRIER,
    tracking: {
      status: 'delivered',
      stepTimes: {
        processing: '2024-09-23T09:41:00+06:00',
        shipped: '2024-09-24T15:18:00+06:00',
        out_for_delivery: '2024-09-26T07:52:00+06:00',
        delivered: '2024-09-26T13:47:00+06:00',
      },
      eta: ETA_THU,
      awaitingCarrier: false,
      scans: [
        scan('s7', 'Delivered · left at front door', '2024-09-26T13:47:00+06:00', 'Banani, Dhaka'),
        ...TRANSIT_SCANS,
      ],
      proof: {
        deliveredAt: '2024-09-26T13:47:00+06:00',
        location: 'Front door',
        hasPhoto: true,
        signatureRequired: false,
      },
      refundEligible: false,
      notifyOnShip: true,
      lastUpdated: '2024-09-26T13:48:00+06:00',
    },
  };
}

export function awaitingCarrierOrder(): Order {
  return {
    ...baseOrder('2024-09-23T09:41:00+06:00'),
    carrier: null,
    tracking: {
      status: 'processing',
      stepTimes: { processing: '2024-09-23T09:41:00+06:00' },
      eta: { start: '2024-09-26T09:00:00+06:00', end: '2024-09-30T21:00:00+06:00' },
      awaitingCarrier: true,
      scans: [],
      refundEligible: false,
      notifyOnShip: true,
      lastUpdated: '2024-09-23T14:00:00+06:00',
    },
  };
}
