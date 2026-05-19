import { LucideIcon, Inbox } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ icon: Icon = Inbox, title, description, action, className = "" }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
    <div className="relative mb-4">
      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
      <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center border border-border">
        <Icon className="h-7 w-7 text-primary" />
      </div>
    </div>
    <h3 className="font-heading text-base font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;