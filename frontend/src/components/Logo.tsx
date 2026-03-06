interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 48 }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={size} 
      height={size} 
      className={className}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="100" fill="url(#grad1)" />
      <circle cx="256" cy="256" r="160" fill="none" stroke="white" strokeWidth="32" />
      <path d="M180 256 L230 310 L340 190" fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
