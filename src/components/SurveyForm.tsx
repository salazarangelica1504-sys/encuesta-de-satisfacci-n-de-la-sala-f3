import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Sheet, 
  Wifi, 
  Monitor, 
  Wind, 
  Armchair, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { SurveyResponse, GoogleSheetsConfig } from '../types/survey';

interface SurveyFormProps {
  onAddResponse: (response: SurveyResponse) => Promise<{ syncedToSheets: boolean; error?: string }>;
  sheetsConfig: GoogleSheetsConfig;
  isLoggedInGoogle: boolean;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  onAddResponse,
  sheetsConfig,
  isLoggedInGoogle,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Form State - 10 questions
  const [role, setRole] = useState<SurveyResponse['role']>('Aprendiz');
  const [frequency, setFrequency] = useState<SurveyResponse['frequency']>('2 a 3 veces por semana');
  const [purpose, setPurpose] = useState<SurveyResponse['purpose']>('Formación académica / Clases');
  
  const [equipmentRating, setEquipmentRating] = useState<number>(4);
  const [internetRating, setInternetRating] = useState<number>(3);
  const [environmentRating, setEnvironmentRating] = useState<number>(4);
  const [furnitureRating, setFurnitureRating] = useState<number>(4);

  const [overallSatisfaction, setOverallSatisfaction] = useState<number>(4);
  const [recommendation, setRecommendation] = useState<SurveyResponse['recommendation']>('Sí');
  const [aspectsToImprove, setAspectsToImprove] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string>('');

  const toggleAspect = (aspect: string) => {
    if (aspectsToImprove.includes(aspect)) {
      setAspectsToImprove(aspectsToImprove.filter((a) => a !== aspect));
    } else {
      setAspectsToImprove([...aspectsToImprove, aspect]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSyncStatusMessage(null);

    const newResponse: SurveyResponse = {
      id: 'resp-' + Date.now(),
      timestamp: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      role,
      frequency,
      purpose,
      equipmentRating,
      internetRating,
      environmentRating,
      furnitureRating,
      overallSatisfaction,
      recommendation,
      aspectsToImprove,
      suggestions: suggestions.trim(),
    };

    try {
      const result = await onAddResponse(newResponse);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch {
        // Safe confetti fallback
      }

      setSubmittedSuccess(true);
      if (result.syncedToSheets) {
        setSyncStatusMessage('¡Respuesta guardada y sincronizada directamente en Google Sheets!');
      } else if (result.error) {
        setSyncStatusMessage('Guardado en la aplicación. Nota de sincronización: ' + result.error);
      } else {
        setSyncStatusMessage('Respuesta guardada en el registro local.');
      }
    } catch (err: any) {
      console.error('Error enviando formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setRole('Aprendiz');
    setFrequency('2 a 3 veces por semana');
    setPurpose('Formación académica / Clases');
    setEquipmentRating(4);
    setInternetRating(3);
    setEnvironmentRating(4);
    setFurnitureRating(4);
    setOverallSatisfaction(4);
    setRecommendation('Sí');
    setAspectsToImprove([]);
    setSuggestions('');
    setSubmittedSuccess(false);
    setSyncStatusMessage(null);
  };

  // Star / Rating Selector Helper
  const renderRatingBar = (
    label: string,
    sublabel: string,
    icon: React.ReactNode,
    value: number,
    setValue: (v: number) => void
  ) => {
    return (
      <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-800">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{label}</h4>
            <p className="text-xs text-slate-500">{sublabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mt-3">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setValue(num)}
                className={`py-2 px-1 text-center rounded-lg font-bold text-xs transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600 ring-offset-1'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                <span className="text-sm">★</span>
                <span>{num}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
          <span>Deficiente (1)</span>
          <span>Aceptable (3)</span>
          <span>Excelente (5)</span>
        </div>
      </div>
    );
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-emerald-100">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            SENA • Centro Agropecuario de Buga
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ¡Muchas gracias por tu respuesta!
          </h2>

          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Tus aportes sobre la <strong>Sala de Cómputo F3</strong> son fundamentales para gestionar mantenimientos, mejorar el servicio de Internet y adecuar los equipos para la formación técnica.
          </p>

          {syncStatusMessage && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 max-w-md mx-auto">
              <Sheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncStatusMessage}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Registrar otra respuesta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
            SENA • Centro Agropecuario de Buga
          </span>
          <span className="text-xs text-emerald-200/90 font-mono">
            Ambiente F3 • 10 Preguntas
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
          Encuesta de Satisfacción Sala F3
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
          Evalúa el estado de las instalaciones, equipos informáticos, conectividad a Internet y ambiente de estudio en la sala de computación F3.
        </p>

        {/* Sync Indicator */}
        <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Destino de respuestas:</span>
            {sheetsConfig.spreadsheetId ? (
              <span className="font-semibold text-white bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/50">
                Google Sheets ({sheetsConfig.spreadsheetName || 'Vinculada'})
              </span>
            ) : sheetsConfig.appsScriptUrl ? (
              <span className="font-semibold text-white bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/50">
                Apps Script Webhook
              </span>
            ) : (
              <span className="text-amber-200 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-600/40">
                Almacenamiento Local (Configurar Sheets en pestaña superior)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="mb-6 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition px-2 py-1 rounded ${
            step === 1 ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            step === 1 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-500'
          }`}>1</span>
          <span className="hidden sm:inline">Perfil y Uso</span>
        </button>

        <div className="h-0.5 flex-1 mx-2 bg-slate-200">
          <div className={`h-full bg-emerald-600 transition-all ${
            step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'
          }`}></div>
        </div>

        <button
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition px-2 py-1 rounded ${
            step === 2 ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            step === 2 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-500'
          }`}>2</span>
          <span className="hidden sm:inline">Evaluación Técnica</span>
        </button>

        <div className="h-0.5 flex-1 mx-2 bg-slate-200">
          <div className={`h-full bg-emerald-600 transition-all ${
            step === 3 ? 'w-full' : 'w-0'
          }`}></div>
        </div>

        <button
          onClick={() => setStep(3)}
          className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition px-2 py-1 rounded ${
            step === 3 ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            step === 3 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-500'
          }`}>3</span>
          <span className="hidden sm:inline">Satisfacción & Sugerencias</span>
        </button>
      </div>

      {/* Main Survey Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">

        {/* STEP 1: Perfil y Frecuencia de Uso */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                <span>Paso 1: Identificación y Uso del Ambiente</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cuéntanos sobre tu rol y la frecuencia con la que accedes a la sala F3 en Buga.
              </p>
            </div>

            {/* Pregunta 1 */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-slate-900">
                1. ¿Cuál es tu relación con el Centro Agropecuario de Buga? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {(['Aprendiz', 'Instructor', 'Administrativo', 'Egresado', 'Visitante / Externo'] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${
                      role === r
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-3">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pregunta 2 */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-slate-900">
                2. ¿Con qué frecuencia utilizas el ambiente F3? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {([
                  'Todos los días',
                  '2 a 3 veces por semana',
                  'Una vez por semana',
                  'Ocasionalmente',
                  'Primera vez',
                ] as const).map((f) => (
                  <label
                    key={f}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${
                      frequency === f
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={f}
                      checked={frequency === f}
                      onChange={() => setFrequency(f)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-3">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pregunta 3 */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-bold text-slate-900">
                3. ¿Para qué utilizas principalmente el ambiente F3? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {([
                  'Formación académica / Clases',
                  'Investigaciones y proyectos',
                  'Evaluaciones y pruebas',
                  'Trabajo autónomo y consultas',
                ] as const).map((p) => (
                  <label
                    key={p}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${
                      purpose === p
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={p}
                      checked={purpose === p}
                      onChange={() => setPurpose(p)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-3">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Siguiente botón */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continuar a Evaluación Técnica</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Evaluación Técnica y Ambiental */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Paso 2: Evaluación de Infraestructura y Equipamiento
              </h3>
              <p className="text-xs text-slate-500">
                Califica de 1 a 5 cada uno de los aspectos técnicos del ambiente de computación F3.
              </p>
            </div>

            {/* Pregunta 4: Equipos */}
            {renderRatingBar(
              '4. Disponibilidad y estado de los equipos de cómputo',
              'Rendimiento de los computadores, pantallas, teclados, mouse y encendido.',
              <Monitor className="w-4 h-4 text-emerald-700" />,
              equipmentRating,
              setEquipmentRating
            )}

            {/* Pregunta 5: Internet */}
            {renderRatingBar(
              '5. Calidad y velocidad de la conectividad a Internet',
              'Estabilidad de la red para abrir plataformas, descargar materiales e investigar.',
              <Wifi className="w-4 h-4 text-emerald-700" />,
              internetRating,
              setInternetRating
            )}

            {/* Pregunta 6: Climatización y Ventilación */}
            {renderRatingBar(
              '6. Condiciones ambientales (Clima, ventilación e iluminación)',
              'Temperatura de la sala, funcionamiento del aire acondicionado y nivel de luz.',
              <Wind className="w-4 h-4 text-emerald-700" />,
              environmentRating,
              setEnvironmentRating
            )}

            {/* Pregunta 7: Mobiliario */}
            {renderRatingBar(
              '7. Comodidad y distribución del mobiliario (sillas, mesas y espacio)',
              'Ergonomía de las sillas, espacio de trabajo personal y orden general.',
              <Armchair className="w-4 h-4 text-emerald-700" />,
              furnitureRating,
              setFurnitureRating
            )}

            {/* Botones de navegación */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continuar a Satisfacción y Mejoras</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Satisfacción General y Recomendaciones */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Paso 3: Satisfacción General y Sugerencias de Mejora
              </h3>
              <p className="text-xs text-slate-500">
                Tus opiniones finales nos ayudan a priorizar las mejoras en la sala F3 del Centro Agropecuario.
              </p>
            </div>

            {/* Pregunta 8: Satisfacción General */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <label className="block text-sm font-bold text-emerald-950 mb-1">
                8. En general, ¿qué tan satisfecho estás con el ambiente de computación F3? <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-emerald-800/80 mb-3">
                Calificación integral de tu experiencia de aprendizaje en esta sala.
              </p>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => {
                  const isSelected = overallSatisfaction === num;
                  const labelMap: Record<number, string> = {
                    1: 'Muy insatisfecho',
                    2: 'Insatisfecho',
                    3: 'Neutral',
                    4: 'Satisfecho',
                    5: 'Muy satisfecho',
                  };
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setOverallSatisfaction(num)}
                      className={`p-3 text-center rounded-xl font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/30 scale-105'
                          : 'bg-white text-slate-700 border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50'
                      }`}
                    >
                      <span className="text-lg">★</span>
                      <span className="text-sm font-extrabold">{num}</span>
                      <span className="text-[10px] hidden md:block opacity-90">{labelMap[num]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pregunta 9: Recomendarías */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                9. ¿Recomendarías el ambiente F3 para realizar actividades de formación? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {(['Sí', 'Tal vez', 'No'] as const).map((r) => {
                  const isSelected = recommendation === r;
                  const colors = {
                    'Sí': isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'text-emerald-800 border-emerald-200 hover:bg-emerald-50',
                    'Tal vez': isSelected ? 'bg-amber-600 text-white border-amber-600' : 'text-amber-800 border-amber-200 hover:bg-amber-50',
                    'No': isSelected ? 'bg-rose-600 text-white border-rose-600' : 'text-rose-800 border-rose-200 hover:bg-rose-50',
                  };
                  return (
                    <label
                      key={r}
                      className={`flex items-center justify-center p-3.5 rounded-xl border cursor-pointer font-bold transition text-center ${colors[r]}`}
                    >
                      <input
                        type="radio"
                        name="recommendation"
                        value={r}
                        checked={recommendation === r}
                        onChange={() => setRecommendation(r)}
                        className="sr-only"
                      />
                      <span>{r}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Pregunta 10: Aspectos a Mejorar y Sugerencias */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                10. ¿Qué aspectos consideras que necesitan mejorar y qué sugerencias tienes?
              </label>
              <p className="text-xs text-slate-500">
                Marca los aspectos prioritarios para la administración del centro:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'Velocidad de Internet / Conectividad',
                  'Equipos / Computadores',
                  'Aire acondicionado / Ventilación',
                  'Mobiliario y sillas ergonómicas',
                  'Software y licencias instaladas',
                  'No considero necesario realizar mejoras',
                ].map((aspect) => {
                  const isChecked = aspectsToImprove.includes(aspect);
                  return (
                    <label
                      key={aspect}
                      className={`flex items-center p-2.5 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAspect(aspect)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2.5">{aspect}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sugerencias o comentarios adicionales:
                </label>
                <textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  rows={3}
                  placeholder="Ej: Aumentar el ancho de banda en horas de clase, cambiar las sillas dañadas de la fila 2..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
                ></textarea>
              </div>
            </div>

            {/* Botones de Envío y Atrás */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>Enviando respuestas...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar a Google Sheets</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </form>
    </div>
  );
};
