import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Camera, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formValidation, setFormValidation] = useState({
    email: { isValid: true, message: "" },
    phone: { isValid: true, message: "" },
    document: { isValid: true, message: "" }
  });

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

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const validateDocument = (doc: string) => {
    const cleaned = doc.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14; // CPF ou CNPJ
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const isValid = validateEmail(value);
      setFormValidation(prev => ({
        ...prev,
        email: {
          isValid,
          message: isValid ? "" : "Digite um e-mail válido"
        }
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Format phone as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 10) {
      formatted = cleaned.replace(/^(\d{2})(\d{4,5})(\d{4}).*/, '($1) $2-$3');
    } else if (cleaned.length >= 6) {
      formatted = cleaned.replace(/^(\d{2})(\d{4}).*/, '($1) $2');
    } else if (cleaned.length >= 2) {
      formatted = cleaned.replace(/^(\d{2}).*/, '($1)');
    }
    
    setPhone(formatted);
    if (value) {
      const isValid = validatePhone(value);
      setFormValidation(prev => ({
        ...prev,
        phone: {
          isValid,
          message: isValid ? "" : "Digite um telefone válido"
        }
      }));
    }
  };

  const handleDocumentChange = (value: string) => {
    // Format CPF/CNPJ as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length === 11) {
      formatted = cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      formatted = cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    }
    
    setDocNumber(formatted);
    if (value) {
      const isValid = validateDocument(value);
      setFormValidation(prev => ({
        ...prev,
        document: {
          isValid,
          message: isValid ? "" : "Digite um CPF ou CNPJ válido"
        }
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A foto deve ter no máximo 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const generateQr = (prefix?: string | null) => {
    const base = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `${prefix ? prefix + "-" : "MP-"}${base}`;
  };

  const uploadPhotoIfAny = async (): Promise<string | null> => {
    if (!photoFile) return null;
    
    setUploadProgress(10);
    const path = `anonymous/${crypto.randomUUID()}-${photoFile.name}`;
    
    setUploadProgress(50);
    const { error } = await supabase.storage
      .from("participant-photos")
      .upload(path, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });
      
    setUploadProgress(90);
    
    if (error) {
      console.error(error);
      toast.error("Falha ao enviar a foto. Tente novamente.");
      setUploadProgress(0);
      return null;
    }
    
    setUploadProgress(100);
    return path; // Guardar o caminho interno; bucket não é público
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    // Validate all fields
    if (!name.trim()) {
      toast.error("Preencha seu nome completo.");
      return;
    }

    if (!email || !formValidation.email.isValid) {
      toast.error("Digite um e-mail válido.");
      return;
    }

    if (phone && !formValidation.phone.isValid) {
      toast.error("Digite um telefone válido.");
      return;
    }

    if (docNumber && !formValidation.document.isValid) {
      toast.error("Digite um documento válido.");
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
    setUploadProgress(0);

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
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-muted-foreground">Carregando evento...</p>
        </div>
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
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <div className="relative">
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => handleEmailChange(e.target.value)} 
                      required 
                      placeholder="seu@email.com"
                      className={cn(!formValidation.email.isValid && email && "border-destructive")}
                    />
                    {email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formValidation.email.isValid ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                  {!formValidation.email.isValid && email && (
                    <p className="text-xs text-destructive mt-1">{formValidation.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <div className="relative">
                    <Input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => handlePhoneChange(e.target.value)} 
                      placeholder="(11) 99999-9999"
                      className={cn(!formValidation.phone.isValid && phone && "border-destructive")}
                    />
                    {phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formValidation.phone.isValid ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                  {!formValidation.phone.isValid && phone && (
                    <p className="text-xs text-destructive mt-1">{formValidation.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Documento (CPF/CNPJ)</label>
                  <div className="relative">
                    <Input 
                      value={docNumber} 
                      onChange={(e) => handleDocumentChange(e.target.value)} 
                      placeholder="000.000.000-00"
                      className={cn(!formValidation.document.isValid && docNumber && "border-destructive")}
                    />
                    {docNumber && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formValidation.document.isValid ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                  {!formValidation.document.isValid && docNumber && (
                    <p className="text-xs text-destructive mt-1">{formValidation.document.message}</p>
                  )}
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
                <div className="space-y-3">
                  <div className="relative">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      className="file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground"
                    />
                    <Camera className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {photoPreview && (
                    <div className="relative w-32 h-32 mx-auto">
                      <img 
                        src={photoPreview} 
                        alt="Preview da foto" 
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG. Máximo 5MB. Opcional.
                  </p>
                </div>
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

              {submitting && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enviando dados...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    "Concluir inscrição"
                  )}
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
