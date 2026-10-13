export default function ByteMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="12" y="18" width="40" height="34" rx="12" fill="#1E1838" />
      <rect x="14" y="20" width="36" height="30" rx="10" fill="#7C3AED" />
      <circle cx="26" cy="36" r="4.5" fill="#2DD4BF" />
      <circle cx="38" cy="36" r="4.5" fill="#2DD4BF" />
      <rect x="29" y="10" width="6" height="12" rx="3" fill="#A855F7" />
      <circle cx="32" cy="10" r="3.5" fill="#2DD4BF" />
      <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#2DD4BF" opacity="0.8" />
    </svg>
  );
}
