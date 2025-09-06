import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { Download, FileText, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tag } from '@/components/ui/Tag';

export default function Relatorios() {
  const { getParticipantesByEvento, getCheckinsByEvento } = useAppStore();
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    tipoIngresso: 'todos',
    status: 'todos',
    metodo: 'todos'
  });

  const participantes = getParticipantesByEvento('1');
  const checkins = getCheckinsByEvento('1');

  // Filter logic
  const filteredData = participantes.filter(p => {
    if (filters.tipoIngresso !== 'todos' && p.tipoIngresso !== filters.tipoIngresso) {
      return false;
    }
    if (filters.status !== 'todos' && p.statusCheckin !== filters.status) {
      return false;
    }
    
    // Filter by check-in method
    if (filters.metodo !== 'todos') {
      const checkin = checkins.find(c => c.participanteId === p.id);
      if (!checkin || checkin.metodo !== filters.metodo) {
        return false;
      }
    }
    
    return true;
  });

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Documento', 'Tipo Ingresso', 'Status', 'Data Check-in', 'Método'];
    const csvData = filteredData.map(p => {
      const checkin = checkins.find(c => c.participanteId === p.id);
      return [
        p.nome,
        p.email,
        p.documento,
        p.tipoIngresso,
        p.statusCheckin,
        checkin ? format(checkin.timestamp, 'dd/MM/yyyy HH:mm') : '',
        checkin ? checkin.metodo : ''
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-participantes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const generatePDF = () => {
    // Mock PDF generation - would integrate with a PDF library in production
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Participantes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Participantes</h1>
              <p>Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
              <p>Total de registros: ${filteredData.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData.map(p => `
                  <tr>
                    <td>${p.nome}</td>
                    <td>${p.email}</td>
                    <td>${p.tipoIngresso}</td>
                    <td>${p.statusCheckin}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      pdfWindow.document.close();
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      'checkin_ok': { status: 'ok' as const, label: 'Check-in OK' },
      'nao_chegado': { status: 'pendente' as const, label: 'Pendente' },
      'duplicado': { status: 'warning' as const, label: 'Duplicado' },
      'bloqueado': { status: 'erro' as const, label: 'Bloqueado' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || 
                  { status: 'pendente' as const, label: status };
    
    return <Tag status={config.status}>{config.label}</Tag>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Relatórios
        </h1>
        <p className="text-muted-foreground">
          Exporte e analise dados do credenciamento
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Tipo de Ingresso</Label>
              <Select value={filters.tipoIngresso} onValueChange={(value) => setFilters(prev => ({ ...prev, tipoIngresso: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="checkin_ok">Check-in OK</SelectItem>
                  <SelectItem value="nao_chegado">Pendente</SelectItem>
                  <SelectItem value="duplicado">Duplicado</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Método</Label>
              <Select value={filters.metodo} onValueChange={(value) => setFilters(prev => ({ ...prev, metodo: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="qr">QR Code</SelectItem>
                  <SelectItem value="face">Facial</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Mostrando {filteredData.length} de {participantes.length} registros
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={generatePDF}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((participante) => {
                const checkin = checkins.find(c => c.participanteId === participante.id);
                
                return (
                  <TableRow key={participante.id}>
                    <TableCell className="font-medium">
                      {participante.nome}
                    </TableCell>
                    <TableCell>{participante.email}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {participante.documento}
                    </TableCell>
                    <TableCell>{participante.tipoIngresso}</TableCell>
                    <TableCell>
                      {getStatusTag(participante.statusCheckin)}
                    </TableCell>
                    <TableCell>
                      {checkin ? format(checkin.timestamp, 'dd/MM HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      {checkin ? (
                        <Tag status="ok">
                          {checkin.metodo === 'qr' ? 'QR' : 
                           checkin.metodo === 'face' ? 'Facial' : 'Manual'}
                        </Tag>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}