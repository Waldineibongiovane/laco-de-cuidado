import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Star, Loader2 } from "lucide-react";

export default function TopCaregiversRanking() {
  const { data: topCaregivers, isLoading } = trpc.caregiver.topRanked.useQuery({ limit: 6 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!topCaregivers || topCaregivers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Cuidadores Melhores Avaliados
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCaregivers.map((caregiver: any) => (
          <Link key={caregiver.userId} href={`/cuidador/${caregiver.userId}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {caregiver.photoUrl ? (
                    <img
                      src={caregiver.photoUrl}
                      alt={caregiver.firstName}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {caregiver.firstName.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{caregiver.firstName}</h3>
                    <p className="text-sm text-muted-foreground">{caregiver.city}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(caregiver.avgRating)
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {caregiver.avgRating.toFixed(1)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {caregiver.reviewCount} avaliações
                      </Badge>
                    </div>

                    {caregiver.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {caregiver.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
