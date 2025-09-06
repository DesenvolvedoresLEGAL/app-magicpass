import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Tipos auxiliares para os campos dinâmicos
type RegistrationField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "tel" | string;
  required?: boolean;
};

type TicketCategory = {
  id: string;
  label: string;
  description?: string;
};

type EventData = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  start_date: string;
  end_date: string;
  qr_prefix?: string | null;
  lgpd_text?: string | null;
  registration_fields: RegistrationField[];
  ticket_categories: TicketCategory[];
};

export default function PublicRegister() {
  const { eventId } = useParams<{ eventId: string }>();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Campos básicos
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Campos dinâmicos
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  const registrationFields = useMemo(() => event?.registration_fields ?? [], [event]);
  const ticketCategories = useMemo(() => event?.ticket_categories ?? [], [event]);

  useEffect(() => {
    document.title = event ? `${event.name} | Inscrição MagicPass` : "Inscrição | MagicPass";
    const metaDesc = document.querySelector('meta[name="description"]');
    const text = event
      ? `Inscreva-se no evento ${event.name} com o MagicPass. Cadastro rápido e seguro (LGPD).`
      : "Inscrição de participantes com MagicPass.";
    if (metaDesc) metaDesc.setAttribute("content", text);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [event]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, description, location, start_date, end_date, qr_prefix, lgpd_text, registration_fields, ticket_categories"
        )
        .eq("id", eventId)
        .eq("status", "active")
        .single();

      if (error) {
        toast.error("Evento não encontrado ou indisponível.");
        setLoading(false);
        return;
      }

      // Garantir arrays
      const reg = Array.isArray(data.registration_fields) ? data.registration_fields : [];
      const cat = Array.isArray(data.ticket_categories) ? data.ticket_categories : [];

      setEvent({ ...data, registration_fields: reg, ticket_categories: cat } as EventData);
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  const handleDynamicChange = (id: string, value: any) => {
    setDynamicValues((prev) => ({ ...prev, [id]: value }));
  };

  const generateQr = (prefix?: string | null) => {
    const base = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `${prefix ? prefix + "-" : "MP-"}${base}`;
  };

  const uploadPhotoIfAny = async (): Promise<string | null> => {
    if (!photoFile) return null;
    const path = `anonymous/${crypto.randomUUID()}-${photoFile.name}`;
    const { error } = await supabase.storage
      .from("participant-photos")
      .upload(path, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });
    if (error) {
      console.error(error);
      toast.error("Falha ao enviar a foto. Tente novamente.");
      return null;
    }
    return path; // Guardar o caminho interno; bucket não é público
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!name || !email) {
      toast.error("Preencha nome e e-mail.");
      return;
    }

    if (!ticketCategory) {
      toast.error("Selecione uma categoria de ingresso.");
      return;
    }

    if (!lgpdAccepted) {
      toast.error("É necessário aceitar a LGPD para continuar.");
      return;
    }

    // Validar campos dinâmicos obrigatórios
    for (const f of registrationFields) {
      if (f.required && (dynamicValues[f.id] === undefined || dynamicValues[f.id] === "")) {
        toast.error(`Preencha o campo: ${f.label}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const photoPath = await uploadPhotoIfAny();
      const qr_code = generateQr(event.qr_prefix);

      const { data, error } = await supabase
        .from("participants")
        .insert([
          {
            event_id: event.id,
            name,
            email,
            phone: phone || null,
            document: docNumber || null,
            ticket_category: ticketCategory,
            registration_data: dynamicValues,
            qr_code,
            photo_url: photoPath,
            lgpd_consent: true,
            lgpd_consent_date: new Date().toISOString(),
            status: "registered",
          },
        ])
        .select("qr_code")
        .single();

      if (error) throw error;

      setSuccessCode(data.qr_code);
      toast.success("Inscrição realizada com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error("Não foi possível concluir sua inscrição.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 px-6">
          <h1 className="text-2xl font-bold">Evento indisponível</h1>
          <p className="text-muted-foreground">Verifique o link de inscrição ou contate o organizador.</p>
        </div>
      </div>
    );
  }

  if (successCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <article className="w-full max-w-lg bg-card border rounded-xl p-6 shadow-sm">
          <header className="mb-4">
            <h1 className="text-xl font-semibold">Inscrição confirmada</h1>
            <p className="text-sm text-muted-foreground">Apresente este código no credenciamento:</p>
          </header>
          <section className="space-y-4">
            <div className="rounded-lg border bg-background p-4 text-center">
              <p className="font-mono text-lg tracking-wider">{successCode}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Você receberá informações adicionais do organizador por e-mail.
            </p>
            <Button onClick={() => navigator.clipboard.writeText(successCode)}>Copiar código</Button>
          </section>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="py-10 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{event.description}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            <span>{event.location}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-4xl pb-16">
        <section className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome completo</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Documento</label>
                  <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                </div>
              </div>

              {registrationFields.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold">Informações adicionais</h2>
                  {registrationFields.map((f) => (
                    <div key={f.id}>
                      <label className="block text-sm font-medium mb-1">{f.label}{f.required ? " *" : ""}</label>
                      {f.type === "textarea" ? (
                        <Textarea
                          value={dynamicValues[f.id] || ""}
                          onChange={(e) => handleDynamicChange(f.id, e.target.value)}
                          required={!!f.required}
                        />
                      ) : (
                        <Input
                          type={f.type === "email" || f.type === "tel" ? (f.type as any) : "text"}
                          value={dynamicValues[f.id] || ""}
                          onChange={(e) => handleDynamicChange(f.id, e.target.value)}
                          required={!!f.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Categoria do ingresso</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>
                  {ticketCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {ticketCategory && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {ticketCategories.find((c) => c.id === ticketCategory)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Foto (facial)</label>
                <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground mt-1">Formato: JPG/PNG. Opcional neste MVP.</p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="lgpd"
                  type="checkbox"
                  className="mt-1"
                  checked={lgpdAccepted}
                  onChange={(e) => setLgpdAccepted(e.target.checked)}
                />
                <label htmlFor="lgpd" className="text-sm text-muted-foreground">
                  {event.lgpd_text ||
                    "Ao prosseguir, você concorda com o tratamento dos seus dados pessoais de acordo com a LGPD."}
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Concluir inscrição"}
                </Button>
              </div>
            </form>
          </div>

          <aside className="md:col-span-2 space-y-4">
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold">Sobre o evento</h3>
              <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold">Dicas</h3>
              <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Tenha seu documento em mãos no dia do evento.</li>
                <li>Chegue com antecedência para evitar filas.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
