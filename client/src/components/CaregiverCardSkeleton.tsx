import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaregiverCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
