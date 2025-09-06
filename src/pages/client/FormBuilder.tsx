import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Save, 
  Type, Mail, Phone, Hash, CheckSquare, Upload,
  Calendar, Clock, MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'checkbox' | 'textarea' | 'file' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const fieldTypes = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Telefone', icon: Phone },
  { value: 'number', label: 'Número', icon: Hash },
  { value: 'select', label: 'Seleção', icon: CheckSquare },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'textarea', label: 'Texto Longo', icon: Type },
  { value: 'file', label: 'Upload', icon: Upload },
  { value: 'date', label: 'Data', icon: Calendar },
  { value: 'time', label: 'Hora', icon: Clock },
];

export function FormBuilder() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventName, setEventName] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventForm();
    }
  }, [eventId]);

  const loadEventForm = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('name, registration_fields')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      
      if (data) {
        setEventName(data.name);
        setFields((data.registration_fields as unknown as FormField[]) || []);
      }
    } catch (error) {
      console.error('Error loading event form:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar formulário do evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `Campo ${fields.length + 1}`,
      required: false,
      placeholder: '',
      options: type === 'select' ? ['Opção 1', 'Opção 2'] : undefined
    };
    
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  const saveForm = async () => {
    if (!eventId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ registration_fields: fields as any })
        .eq('id', eventId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Formulário salvo com sucesso",
      });
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar formulário",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFieldPreview = (field: FormField, index: number) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
      className: "mt-1"
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <Input {...commonProps} type={field.type} />;
      
      case 'textarea':
        return <Textarea {...commonProps} />;
      
      case 'select':
        return (
          <Select>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 mt-1">
            <input type="checkbox" id={field.id} className="rounded" />
            <Label htmlFor={field.id} className="text-sm">
              {field.placeholder || 'Aceito os termos'}
            </Label>
          </div>
        );
      
      case 'file':
        return <Input {...commonProps} type="file" />;
      
      case 'date':
        return <Input {...commonProps} type="date" />;
      
      case 'time':
        return <Input {...commonProps} type="time" />;
      
      default:
        return <Input {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/client/eventos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Construtor de Formulário</h1>
          <p className="text-muted-foreground">
            Configurar campos de inscrição para: <strong>{eventName}</strong>
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={!showPreview ? "default" : "outline"}
          onClick={() => setShowPreview(false)}
        >
          Editor
        </Button>
        <Button
          variant={showPreview ? "default" : "outline"}
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      {!showPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Field Types Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipos de Campo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {fieldTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => addField(type.value as FormField['type'])}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="text-left">
                        <div className="font-medium">{type.label}</div>
                      </span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Form Builder */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Campos do Formulário</h2>
              <Button onClick={saveForm} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>

            {fields.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum campo adicionado. Clique em um tipo de campo à esquerda para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="relative"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                                  </div>
                                  <Badge variant="secondary">
                                    {fieldTypes.find(t => t.value === field.type)?.label}
                                  </Badge>
                                  <Switch
                                    checked={field.required}
                                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                                  />
                                  <span className="text-sm text-muted-foreground">Obrigatório</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto text-destructive hover:text-destructive"
                                    onClick={() => removeField(field.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Rótulo do Campo</Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                                      placeholder="Ex: Nome completo"
                                    />
                                  </div>
                                  <div>
                                    <Label>Placeholder</Label>
                                    <Input
                                      value={field.placeholder || ''}
                                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                      placeholder="Ex: Digite seu nome"
                                    />
                                  </div>
                                </div>

                                {field.type === 'select' && (
                                  <div>
                                    <Label>Opções (uma por linha)</Label>
                                    <Textarea
                                      value={field.options?.join('\n') || ''}
                                      onChange={(e) => updateField(field.id, { 
                                        options: e.target.value.split('\n').filter(o => o.trim()) 
                                      })}
                                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                                      rows={3}
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      ) : (
        /* Preview Panel */
        <Card>
          <CardHeader>
            <CardTitle>Preview do Formulário</CardTitle>
            <p className="text-muted-foreground">
              Como o formulário aparecerá para os participantes
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto space-y-6 p-6 border border-border rounded-lg bg-card">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{eventName}</h2>
                <p className="text-muted-foreground">Formulário de Inscrição</p>
              </div>

              {fields.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nenhum campo configurado
                </p>
              ) : (
                <form className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <Label htmlFor={field.id} className="flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      {renderFieldPreview(field, index)}
                    </div>
                  ))}
                  
                  <Button className="w-full" size="lg" disabled>
                    Finalizar Inscrição
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}