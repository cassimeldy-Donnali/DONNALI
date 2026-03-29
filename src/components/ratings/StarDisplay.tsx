import { Star } from 'lucide-react';

interface StarDisplayProps {
  avg: number;
  count: number;
  size?: 'sm' | 'md';
}

export function StarDisplay({ avg, count, size = 'sm' }: StarDisplayProps) {
  if (count === 0) return null;

  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${starSize} ${s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
          />
        ))}
      </div>
      <span className={`font-semibold text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {avg.toFixed(1)}
      </span>
      <span className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        ({count})
      </span>
    </div>
  );
}
