import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: number;
  label: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const isOnline = status === 1;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
      isOnline
        ? "bg-green-500/20 text-green-600 border border-green-500/30"
        : "bg-red-500/20 text-red-600 border border-red-500/30",
      className
    )}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
      )} />
      {label}
    </div>
  );
};
