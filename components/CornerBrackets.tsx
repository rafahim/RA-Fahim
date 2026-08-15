interface CornerBracketsProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Four L-shaped corner brackets, like a 3D-software viewport frame.
 * Purely decorative (aria-hidden) — pairs with the `.font-hud` monospace
 * label system to give the page a "viewport readout" signature that ties
 * back to the 3D-creator subject matter.
 */
export default function CornerBrackets({
  className = '',
  size = 22,
  color = 'currentColor',
}: CornerBracketsProps) {
  const arm = size * 0.62;
  const stroke = 1.5;

  const corner = (position: 'tl' | 'tr' | 'bl' | 'br') => {
    const posClass = {
      tl: 'top-0 left-0',
      tr: 'top-0 right-0 -scale-x-100',
      bl: 'bottom-0 left-0 -scale-y-100',
      br: 'bottom-0 right-0 -scale-x-100 -scale-y-100',
    }[position];

    return (
      <span
        key={position}
        className={`absolute ${posClass}`}
        style={{ width: size, height: size }}
      >
        <span
          className="absolute top-0 left-0"
          style={{ width: arm, height: stroke, background: color }}
        />
        <span
          className="absolute top-0 left-0"
          style={{ width: stroke, height: arm, background: color }}
        />
      </span>
    );
  };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {corner('tl')}
      {corner('tr')}
      {corner('bl')}
      {corner('br')}
    </div>
  );
}
