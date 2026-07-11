interface BrassOrnamentProps {
  className?: string;
}

export function BrassOrnament({ className }: BrassOrnamentProps) {
  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
        <path d="M110 70 L210 70 L260 130 L160 300 L60 130 Z" />
        <path d="M60 130 L260 130" />
        <path d="M110 70 L160 130" />
        <path d="M210 70 L160 130" />
        <path d="M60 130 L160 300" opacity="0.6" />
        <path d="M260 130 L160 300" opacity="0.6" />
        <path d="M110 70 L60 130" opacity="0.6" />
        <path d="M210 70 L260 130" opacity="0.6" />
        <path d="M160 130 L160 300" opacity="0.35" />
      </g>
      <g stroke="currentColor" strokeWidth="0.75" opacity="0.4">
        <path d="M20 40 L34 40 M27 33 L27 47" />
        <path d="M285 220 L297 220 M291 214 L291 226" />
        <path d="M40 260 L50 260 M45 255 L45 265" />
      </g>
    </svg>
  );
}
