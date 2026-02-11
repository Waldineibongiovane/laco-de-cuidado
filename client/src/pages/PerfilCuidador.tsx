import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { REPORT_REASONS } from "@shared/constants";
import {
  ArrowLeft, MapPin, Star, Phone, Mail, MessageCircle, Clock,
  User, Heart, Shield, Flag, AlertTriangle, CheckCircle2, Hospital
} from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";

export default function PerfilCuidador() {
  const params = useParams<{ id: string }>();
  const userId = parseInt(params.id || "0");
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: caregiver, isLoading } = trpc.caregiver.getProfile.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hired, setHired] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState("");

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      setReviewOpen(false);
      setComment("");
      setRating(5);
      setHired(false);
      utils.caregiver.getProfile.invalidate({ userId });
    },
    onError: () => toast.error("Erro ao enviar avaliação."),
  });

  const createReport = trpc.report.create.useMutation({
    onSuccess: () => {
      toast.success("Denúncia enviada. Obrigado por ajudar a manter a plataforma segura.");
      setReportOpen(false);
      setReportDetails("");
      setReportReason("");
    },
    onError: () => toast.error("Erro ao enviar denúncia."),
  });

  const isFamily = user?.userType === "family" || (isAuthenticated && user?.userType !== "caregiver");
  const canSeeContact = isAuthenticated && isFamily && caregiver?.isAvailable;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-8 flex-1">
          <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-muted rounded w-40" />
                <div className="h-4 bg-muted rounded w-60" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-16 flex-1 text-center">
          <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Cuidador não encontrado</h2>
          <p className="text-muted-foreground mb-4">Este perfil pode ter sido removido ou bloqueado.</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const services = (caregiver.services as string[]) || [];
  const availability = (caregiver.availability as string[]) || [];
  const experienceTypes = (caregiver.experienceTypes as string[]) || [];

  const formatPhone = (phone: string) => phone.replace(/\D/g, "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-6 flex-1">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar à busca
        </button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {caregiver.photoUrl ? (
                  <img src={caregiver.photoUrl} alt={caregiver.firstName} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {caregiver.firstName}
                    </h1>
                    {caregiver.isAvailable ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">Disponível</Badge>
                    ) : (
                      <Badge variant="secondary">Indisponível</Badge>
                    )}
                    {caregiver.acceptsHospitalCompanion && (
                      <Badge variant="outline" className="gap-1">
                        <Hospital className="w-3 h-3" />
                        Acomp. Hospitalar
                      </Badge>
                    )}
                  </div>

                  {caregiver.city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {caregiver.city}{caregiver.neighborhood ? `, ${caregiver.neighborhood}` : ""}
                      {caregiver.serviceRadiusKm && ` (raio de ${caregiver.serviceRadiusKm} km)`}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    {caregiver.avgRating > 0 && (
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {caregiver.avgRating.toFixed(1)}
                        <span className="text-muted-foreground">({caregiver.reviewCount} {caregiver.reviewCount === 1 ? "avaliação" : "avaliações"})</span>
                      </span>
                    )}
                    {caregiver.experienceYears != null && caregiver.experienceYears > 0 && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {caregiver.experienceYears} {caregiver.experienceYears === 1 ? "ano" : "anos"} de exp.
                      </span>
                    )}
                    {caregiver.age && (
                      <span className="text-sm text-muted-foreground">{caregiver.age} anos</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact buttons - only for logged-in families when caregiver is available */}
              {canSeeContact && caregiver.phone && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <a
                    href={`https://wa.me/55${formatPhone(caregiver.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </a>
                  <a href={`tel:${caregiver.phone}`}>
                    <Button variant="outline" className="gap-2">
                      <Phone className="w-4 h-4" />
                      {caregiver.phone}
                    </Button>
                  </a>
                  {caregiver.emailPublic && (
                    <a href={`mailto:${caregiver.emailPublic}`}>
                      <Button variant="outline" className="gap-2">
                        <Mail className="w-4 h-4" />
                        E-mail
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Faça login como família para ver os dados de contato.
                </p>
              )}

              {isAuthenticated && !caregiver.isAvailable && (
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Este cuidador está marcado como indisponível no momento.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          {caregiver.bio && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sobre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{caregiver.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Services & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {services.map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {availability.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Disponibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {availability.map(a => (
                      <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Experience Types */}
          {experienceTypes.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tipos de experiência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {experienceTypes.map(t => (
                    <Badge key={t} variant="outline" className="text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Avaliações ({caregiver.reviewCount})
                </CardTitle>
                {isAuthenticated && isFamily && (
                  <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Star className="w-3.5 h-3.5" />
                        Avaliar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Avaliar {caregiver.firstName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Nota</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button key={n} onClick={() => setRating(n)} className="p-1">
                                <Star className={`w-7 h-7 transition-colors ${n <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Comentário (opcional)</label>
                          <Textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Conte sua experiência..."
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={hired} onCheckedChange={(v) => setHired(!!v)} id="hired" />
                          <label htmlFor="hired" className="text-sm">Contratei este cuidador</label>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => createReview.mutate({
                            caregiverUserId: userId,
                            rating,
                            comment: comment || undefined,
                            hiredCaregiver: hired,
                          })}
                          disabled={createReview.isPending}
                        >
                          {createReview.isPending ? "Enviando..." : "Enviar Avaliação"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {caregiver.reviews && caregiver.reviews.length > 0 ? (
                <div className="space-y-4">
                  {caregiver.reviews.map((r: any) => (
                    <div key={r.id} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                        {r.hiredCaregiver && (
                          <Badge variant="outline" className="text-[10px] gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Contratou
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
              )}
            </CardContent>
          </Card>

          {/* Report */}
          {isAuthenticated && (
            <div className="flex justify-center">
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                    <Flag className="w-4 h-4" />
                    Denunciar perfil
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Denunciar {caregiver.firstName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Motivo</label>
                      <Select value={reportReason} onValueChange={setReportReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_REASONS.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Detalhes (opcional)</label>
                      <Textarea
                        value={reportDetails}
                        onChange={e => setReportDetails(e.target.value)}
                        placeholder="Descreva o problema..."
                        rows={3}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={!reportReason || createReport.isPending}
                      onClick={() => createReport.mutate({
                        reportedUserId: userId,
                        reason: reportReason as any,
                        details: reportDetails || undefined,
                      })}
                    >
                      {createReport.isPending ? "Enviando..." : "Enviar Denúncia"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
