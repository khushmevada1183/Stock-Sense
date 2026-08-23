import { cn } from '@/lib/utils';
import { panelShellClass } from '@/styles/design-tokens';

type PanelShellProps = React.ComponentProps<'section'> & { inset?: boolean };

export function PanelShell({ className, inset = false, ...props }: PanelShellProps) {
  return (
    <section
      className={cn(panelShellClass, inset && 'shadow-none', className)}
      {...props}
    />
  );
}
