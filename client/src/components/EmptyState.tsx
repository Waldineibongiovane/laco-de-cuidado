import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-12 pb-12 text-center">
        <div className="flex justify-center mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
        {action && <div className="flex justify-center">{action}</div>}
      </CardContent>
    </Card>
  );
}
