import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapView } from "@/components/Map";
import { SERVICES_OPTIONS, AVAILABILITY_OPTIONS, EXPERIENCE_TYPE_OPTIONS, DEFAULT_CENTER } from "@shared/constants";
import {
  Search, MapPin, Star, SlidersHorizontal, List, Map as MapIcon,
  Heart, User, Clock, ChevronDown, X, Filter
} from "lucide-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { Link } from "wouter";

export default function BuscarCuidadores() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [city, setCity] = useState("");
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [sortBy, setSortBy] = useState<"newest" | "distance" | "rating" | "recommended">("recommended");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedExpTypes, setSelectedExpTypes] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [acceptsHospital, setAcceptsHospital] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [userLat] = useState(DEFAULT_CENTER.lat);
  const [userLng] = useState(DEFAULT_CENTER.lng);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const { data: caregivers, isLoading } = trpc.caregiver.search.useQuery({
    city: city || undefined,
    maxDistance: maxDistance < 50 ? maxDistance : undefined,
    lat: userLat,
    lng: userLng,
    services: selectedServices.length > 0 ? selectedServices : undefined,
    availability: selectedAvailability.length > 0 ? selectedAvailability : undefined,
    minExperience: minExperience > 0 ? minExperience : undefined,
    experienceTypes: selectedExpTypes.length > 0 ? selectedExpTypes : undefined,
    acceptsHospitalCompanion: acceptsHospital || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    sortBy,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (city) count++;
    if (maxDistance < 50) count++;
    if (selectedServices.length > 0) count++;
    if (selectedAvailability.length > 0) count++;
    if (selectedExpTypes.length > 0) count++;
    if (minExperience > 0) count++;
    if (acceptsHospital) count++;
    if (minRating > 0) count++;
    return count;
  }, [city, maxDistance, selectedServices, selectedAvailability, selectedExpTypes, minExperience, acceptsHospital, minRating]);

  const clearFilters = () => {
    setCity("");
    setMaxDistance(50);
    setSelectedServices([]);
    setSelectedAvailability([]);
    setSelectedExpTypes([]);
    setMinExperience(0);
    setAcceptsHospital(false);
    setMinRating(0);
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Update map markers when caregivers change
  useMemo(() => {
    if (!mapRef.current || !caregivers) return;
    // Clear old markers
    markersRef.current.forEach(m => (m.map = null));
    markersRef.current = [];

    caregivers.forEach((c: any) => {
      if (c.lat && c.lng && window.google) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current!,
          position: { lat: c.lat, lng: c.lng },
          title: c.firstName,
        });
        markersRef.current.push(marker);
      }
    });
  }, [caregivers, viewMode]);

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const FiltersContent = () => (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Cidade</label>
        <Input
          placeholder="Ex: Votuporanga"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Raio de distância: {maxDistance} km</label>
        <Slider
          value={[maxDistance]}
          onValueChange={v => setMaxDistance(v[0])}
          min={5}
          max={50}
          step={5}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Experiência mínima: {minExperience} anos</label>
        <Slider
          value={[minExperience]}
          onValueChange={v => setMinExperience(v[0])}
          min={0}
          max={20}
          step={1}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Avaliação mínima</label>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setMinRating(n)}
              className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                minRating === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {n === 0 ? "Todas" : `${n}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Serviços</label>
        <div className="flex flex-wrap gap-1.5">
          {SERVICES_OPTIONS.map(s => (
            <Badge
              key={s}
              variant={selectedServices.includes(s) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayItem(selectedServices, s, setSelectedServices)}
            >
              {s}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Disponibilidade</label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABILITY_OPTIONS.map(a => (
            <Badge
              key={a}
              variant={selectedAvailability.includes(a) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayItem(selectedAvailability, a, setSelectedAvailability)}
            >
              {a}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Tipo de experiência</label>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_TYPE_OPTIONS.map(t => (
            <Badge
              key={t}
              variant={selectedExpTypes.includes(t) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayItem(selectedExpTypes, t, setSelectedExpTypes)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={acceptsHospital}
          onCheckedChange={(v) => setAcceptsHospital(!!v)}
          id="hospital"
        />
        <label htmlFor="hospital" className="text-sm">Acompanhante hospitalar</label>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
          <X className="w-4 h-4 mr-1" />
          Limpar filtros ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-6 flex-1">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Buscar Cuidadores
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Buscando..." : `${caregivers?.length ?? 0} cuidadores encontrados`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recomendados</SelectItem>
                <SelectItem value="distance">Mais próximos</SelectItem>
                <SelectItem value="rating">Melhor avaliados</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 transition-colors ${viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile filter button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-1 relative">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <div className="pt-6">
                  <h3 className="font-bold text-lg mb-4">Filtros</h3>
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop filters sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs">{activeFilterCount}</Badge>
                  )}
                </h3>
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {viewMode === "map" ? (
              <div className="rounded-xl overflow-hidden border">
                <MapView
                  className="h-[500px] md:h-[600px]"
                  initialCenter={DEFAULT_CENTER}
                  initialZoom={11}
                  onMapReady={handleMapReady}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-xl bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-3 bg-muted rounded w-32" />
                            <div className="h-3 bg-muted rounded w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : caregivers && caregivers.length > 0 ? (
                  caregivers.map((c: any) => (
                    <CaregiverCard key={c.id} caregiver={c} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-1">Nenhum cuidador encontrado</h3>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function CaregiverCard({ caregiver }: { caregiver: any }) {
  const services = (caregiver.services as string[]) || [];
  const displayServices = services.slice(0, 3);

  return (
    <Link href={`/cuidador/${caregiver.userId}`}>
      <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer h-full">
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-3">
            {caregiver.photoUrl ? (
              <img
                src={caregiver.photoUrl}
                alt={caregiver.firstName}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base truncate">{caregiver.firstName}</h3>
                {!caregiver.isAvailable && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">Indisponível</Badge>
                )}
              </div>
              {caregiver.city && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {caregiver.city}{caregiver.neighborhood ? `, ${caregiver.neighborhood}` : ""}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {caregiver.avgRating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-medium">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {caregiver.avgRating.toFixed(1)}
                    <span className="text-muted-foreground">({caregiver.reviewCount})</span>
                  </span>
                )}
                {caregiver.distance != null && (
                  <span className="text-xs text-muted-foreground">
                    {caregiver.distance.toFixed(1)} km
                  </span>
                )}
              </div>
            </div>
          </div>

          {caregiver.experienceYears > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Clock className="w-3 h-3" />
              {caregiver.experienceYears} {caregiver.experienceYears === 1 ? "ano" : "anos"} de experiência
            </p>
          )}

          {displayServices.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayServices.map(s => (
                <Badge key={s} variant="outline" className="text-[10px] font-normal">
                  {s}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{services.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
