import { cn } from '@/lib/utils';
import { Building2, Landmark, LineChart } from 'lucide-react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

type MarketEntity = {
  name: string;
  symbol: string;
  type: 'company' | 'exchange' | 'government';
  logoSrc: string;
};

type MarketEntityTickerProps = React.ComponentProps<'div'> & {
  entities: MarketEntity[];
};

export function MarketEntityTicker({ entities, className, ...props }: MarketEntityTickerProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden border-y border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 py-4 dark:border-gray-700/70 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900',
        className
      )}
      {...props}
    >
      <InfiniteSlider gap={16} reverse duration={90} durationOnHover={45} className="w-full">
        {entities.map((entity) => {
          const TypeIcon =
            entity.type === 'exchange' ? LineChart : entity.type === 'government' ? Landmark : Building2;

          return (
            <div
              key={`entity-${entity.symbol}-${entity.name}`}
              className="pointer-events-none flex min-w-[320px] items-center gap-4 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm dark:border-gray-700/70 dark:bg-gray-900/90"
            >
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-2 dark:border-gray-700/70 dark:bg-slate-100">
                <img
                  alt={`${entity.name} logo`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  src={entity.logoSrc}
                />
              </span>

              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-900 dark:text-white md:text-lg">
                  {entity.name}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <TypeIcon className="h-3 w-3" />
                  {entity.type}
                </p>
              </div>
            </div>
          );
        })}
      </InfiniteSlider>

      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 left-0 h-full w-[160px]"
        direction="left"
      />
      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 right-0 h-full w-[160px]"
        direction="right"
      />
    </div>
  );
}
