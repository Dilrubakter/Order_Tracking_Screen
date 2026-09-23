/**
 * Stand-in for the driver's proof-of-delivery photo (mock data has no real
 * image). Drawn as SVG so it scales cleanly in the thumbnail and viewer.
 */
export function DeliveryPhoto({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="72" height="72" fill="#E9E2D6" />
      <rect x="18" y="6" width="36" height="54" rx="2" fill="#56677A" />
      <rect x="22" y="10" width="28" height="21" rx="1" fill="#6A7B8E" />
      <rect x="22" y="35" width="28" height="21" rx="1" fill="#6A7B8E" />
      <circle cx="47" cy="34" r="1.8" fill="#E9C46A" />
      <rect x="0" y="60" width="72" height="12" fill="#CFC6B6" />
      <rect x="31" y="47" width="22" height="16" rx="1.5" fill="#C89B62" />
      <path d="M31 52.5h22" stroke="#A97C45" strokeWidth="1.5" />
      <path d="M42 47v5.5" stroke="#E8D5B5" strokeWidth="2.5" />
    </svg>
  );
}
