export default function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* House roof */}
      <path
        d="M20 4L4 16h4v16h24V16h4L20 4z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Hanger hook */}
      <path
        d="M20 12c0-2.2 1.8-4 4-4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hanger body */}
      <path
        d="M12 28l8-8 8 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
