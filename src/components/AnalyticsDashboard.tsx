import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Search, 
  Star, 
  Users, 
  Wifi, 
  Monitor, 
  Wind, 
  Armchair, 
  CheckCircle2, 
  Sheet, 
  RefreshCw 
} from 'lucide-react';
import { SurveyResponse, GoogleSheetsConfig } from '../types/survey';

interface AnalyticsDashboardProps {
  responses: SurveyResponse[];
  sheetsConfig: GoogleSheetsConfig;
  onSyncAllPending?: () => void;
  isSyncing?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  responses,
  sheetsConfig,
  onSyncAllPending,
  isSyncing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Metrics
  const total = responses.length;

  const avgSatisfaction = total > 0
    ? (responses.reduce((acc, r) => acc + Number(r.overallSatisfaction), 0) / total).toFixed(1)
    : '0';

  const avgEquipment = total > 0
    ? (responses.reduce((acc, r) => acc + Number(r.equipmentRating), 0) / total).toFixed(1)
    : '0';

  const avgInternet = total > 0
    ? (responses.reduce((acc, r) => acc + Number(r.internetRating), 0) / total).toFixed(1)
    : '0';

  const avgEnvironment = total > 0
    ? (responses.reduce((acc, r) => acc + Number(r.environmentRating), 0) / total).toFixed(1)
    : '0';

  const avgFurniture = total > 0
    ? (responses.reduce((acc, r) => acc + Number(r.furnitureRating), 0) / total).toFixed(1)
    : '0';

  const recommendYesCount = responses.filter((r) => r.recommendation === 'Sí').length;
  const recommendPercent = total > 0 ? Math.round((recommendYesCount / total) * 100) : 0;

  // Role Breakdown
  const roleCounts: Record<string, number> = {};
  responses.forEach((r) => {
    roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
  });

  // Aspects To Improve Breakdown
  const aspectCounts: Record<string, number> = {};
  responses.forEach((r) => {
    (r.aspectsToImprove || []).forEach((asp) => {
      aspectCounts[asp] = (aspectCounts[asp] || 0) + 1;
    });
  });

  // Filtered List
  const filteredResponses = responses.filter((r) => {
    const matchesRole = roleFilter === 'all' || r.role === roleFilter;
    const matchesSearch =
      searchTerm === '' ||
      r.suggestions.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Marca temporal',
      'Relación con el Centro',
      'Frecuencia de uso',
      'Propósito principal',
      'Estado Equipos (1-5)',
      'Internet (1-5)',
      'Clima e Iluminación (1-5)',
      'Mobiliario (1-5)',
      'Satisfacción General (1-5)',
      'Recomendaría',
      'Aspectos a Mejorar',
      'Sugerencias',
    ];

    const rows = responses.map((r) => [
      r.id,
      `"${r.timestamp}"`,
      `"${r.role}"`,
      `"${r.frequency}"`,
      `"${r.purpose}"`,
      r.equipmentRating,
      r.internetRating,
      r.environmentRating,
      r.furnitureRating,
      r.overallSatisfaction,
      `"${r.recommendation}"`,
      `"${(r.aspectsToImprove || []).join('; ')}"`,
      `"${(r.suggestions || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'encuesta_sala_f3_buga_respuestas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Resultados y Análisis • Sala F3
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Métricas consolidadas de la encuesta de satisfacción del Centro Agropecuario de Buga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSyncAllPending && (
            <button
              onClick={onSyncAllPending}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar todo a Google Sheets</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Respuestas
            </span>
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">encuestas</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            Registro activo en el centro
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Satisfacción General
            </span>
            <span className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgSatisfaction}</span>
            <span className="text-xs text-slate-500">/ 5.0</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${(Number(avgSatisfaction) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tasa de Recomendación
            </span>
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{recommendPercent}%</span>
            <span className="text-xs text-slate-500">Recomienda</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {recommendYesCount} de {total} participantes dicen "Sí"
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Calidad de Internet
            </span>
            <span className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <Wifi className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{avgInternet}</span>
            <span className="text-xs text-slate-500">/ 5.0</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">
            Aspecto más crítico reportado
          </p>
        </div>

      </div>

      {/* Ratings by Dimension Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Desglose por aspectos evaluados */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Calificación Promedio por Dimensión (1 a 5)
          </h3>

          <div className="space-y-4 pt-1">
            
            {/* Equipos */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Equipos y Computadores</span>
                </span>
                <span className="font-mono text-emerald-700">{avgEquipment} / 5</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(Number(avgEquipment) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Internet */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-rose-600" />
                  <span>Conectividad e Internet</span>
                </span>
                <span className="font-mono text-rose-600">{avgInternet} / 5</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${(Number(avgInternet) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Clima y Ventilación */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>Clima, Iluminación y Ventilación</span>
                </span>
                <span className="font-mono text-teal-700">{avgEnvironment} / 5</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all"
                  style={{ width: `${(Number(avgEnvironment) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Mobiliario */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mobiliario y Sillas</span>
                </span>
                <span className="font-mono text-indigo-700">{avgFurniture} / 5</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(Number(avgFurniture) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* Aspectos más solicitados para mejorar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Aspectos que Necesitan Mejora (Frecuencia)
          </h3>

          <div className="space-y-2.5 pt-1">
            {Object.entries(aspectCounts).length > 0 ? (
              Object.entries(aspectCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                          {count} menciones ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aún no hay aspectos registrados.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Table of Responses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por rol, comentarios..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500">Filtrar Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todos los roles ({total})</option>
              <option value="Aprendiz">Aprendices</option>
              <option value="Instructor">Instructores</option>
              <option value="Administrativo">Administrativos</option>
            </select>
          </div>
        </div>

        {/* Responses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Frecuencia</th>
                <th className="py-3 px-4">Equipos</th>
                <th className="py-3 px-4">Internet</th>
                <th className="py-3 px-4">Satisfacción</th>
                <th className="py-3 px-4">Recomienda</th>
                <th className="py-3 px-4 max-w-xs">Comentarios / Sugerencias</th>
                <th className="py-3 px-4">Estado Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResponses.length > 0 ? (
                filteredResponses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {r.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {r.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {r.frequency}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800">
                      {r.equipmentRating} ★
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-rose-600">
                      {r.internetRating} ★
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {r.overallSatisfaction} / 5
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium">
                      {r.recommendation}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={r.suggestions}>
                      {r.suggestions || <span className="text-slate-300 italic">Sin comentarios</span>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {r.syncedToSheets ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Local
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron respuestas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
