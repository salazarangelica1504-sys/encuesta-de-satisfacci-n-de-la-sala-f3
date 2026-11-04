import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Sheet, 
  ExternalLink, 
  Copy, 
  Check, 
  PlusCircle, 
  Link as LinkIcon, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types/survey';
import { 
  createSurveySpreadsheet, 
  getGoogleAppsScriptTemplate,
  sendToAppsScriptWebhook 
} from '../services/googleSheets';

interface GoogleSheetsSettingsProps {
  config: GoogleSheetsConfig;
  onUpdateConfig: (newConfig: GoogleSheetsConfig) => void;
  currentUser: User | null;
  accessToken: string | null;
  onLogin: () => void;
}

export const GoogleSheetsSettings: React.FC<GoogleSheetsSettingsProps> = ({
  config,
  onUpdateConfig,
  currentUser,
  accessToken,
  onLogin,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);
  const [manualSheetId, setManualSheetId] = useState(config.spreadsheetId || '');
  const [appsScriptUrlInput, setAppsScriptUrlInput] = useState(config.appsScriptUrl || '');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const appsScriptCode = getGoogleAppsScriptTemplate();

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCreateAutoSheet = async () => {
    if (!accessToken) {
      alert('Por favor conecta primero tu cuenta de Google.');
      return;
    }

    setIsCreatingSheet(true);
    try {
      const res = await createSurveySpreadsheet(
        accessToken,
        'Encuesta de satisfacción sobre la sala F3 (Respuestas) - CAB Buga'
      );
      setCreatedSheetUrl(res.spreadsheetUrl);
      setManualSheetId(res.spreadsheetId);
      
      const newCfg: GoogleSheetsConfig = {
        ...config,
        spreadsheetId: res.spreadsheetId,
        spreadsheetName: 'Encuesta Sala F3 - CAB Buga',
        sheetName: 'Respuestas',
        mode: 'oauth',
      };
      onUpdateConfig(newCfg);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err: any) {
      alert('Error creando la hoja de cálculo: ' + err.message);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSaveManualId = () => {
    let cleanId = manualSheetId.trim();
    // Support pasting full URL like https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
    if (cleanId.includes('/d/')) {
      const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    const newCfg: GoogleSheetsConfig = {
      ...config,
      spreadsheetId: cleanId,
      spreadsheetName: 'Hoja de Google Vinculada',
      mode: 'oauth',
    };
    onUpdateConfig(newCfg);
    setManualSheetId(cleanId);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleSaveWebhook = () => {
    const newCfg: GoogleSheetsConfig = {
      ...config,
      appsScriptUrl: appsScriptUrlInput.trim(),
      mode: config.spreadsheetId ? 'both' : 'webhook',
    };
    onUpdateConfig(newCfg);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleTestWebhook = async () => {
    if (!appsScriptUrlInput.trim()) {
      alert('Por favor ingresa la URL de la aplicación web de Google Apps Script');
      return;
    }

    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    try {
      const sampleResponse = {
        id: 'test-' + Date.now(),
        timestamp: new Date().toLocaleString('es-CO'),
        role: 'Aprendiz' as const,
        frequency: 'Todos los días' as const,
        purpose: 'Formación académica / Clases' as const,
        equipmentRating: 5,
        internetRating: 5,
        environmentRating: 5,
        furnitureRating: 5,
        overallSatisfaction: 5,
        recommendation: 'Sí' as const,
        aspectsToImprove: ['Prueba de Conexión Automática'],
        suggestions: 'Prueba de enlace desde formulario HTML a Google Sheets realizada con éxito.',
      };

      await sendToAppsScriptWebhook(appsScriptUrlInput.trim(), sampleResponse);
      setWebhookTestStatus('¡Envío de prueba realizado! Revisa tu Google Sheet para ver la nueva fila registrada.');
    } catch (err: any) {
      setWebhookTestStatus('Error al contactar el script: ' + err.message);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Sheet className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Conexión con Google Sheets
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Configura cómo deseas que las respuestas de la <strong>Sala de Cómputo F3 del Centro Agropecuario de Buga</strong> se guarden en tu hoja de cálculo de Google.
            </p>
          </div>

          {saveSuccessNotice && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuración guardada</span>
            </div>
          )}
        </div>
      </div>

      {/* METODO 1: Google OAuth Direct API */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Opción A: Conexión Directa con tu Cuenta de Google (Recomendada)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Usa la API oficial de Google Sheets para crear o actualizar tu hoja de respuestas con un solo clic.
            </p>
          </div>
        </div>

        {!currentUser ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <p className="text-sm text-slate-700">
              Inicia sesión con tu cuenta de Google para crear y gestionar tu hoja de cálculo directamente:
            </p>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 shadow-md font-bold text-sm text-slate-700 transition cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Conectar con Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Conectado como: {currentUser.displayName || currentUser.email}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Permiso activo para escribir y consultar Google Sheets
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones de Hoja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Botón Crear Automática */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Crear nueva hoja automáticamente</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Crea una hoja de cálculo con los encabezados exactos del SENA en tu Google Drive.
                </p>
                <button
                  type="button"
                  onClick={handleCreateAutoSheet}
                  disabled={isCreatingSheet}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingSheet ? (
                    <span>Creando en Google Drive...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Crear Hoja en mi Google Drive</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vincular Existente */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-emerald-600" />
                  <span>Vincular hoja existente</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Pega el ID o enlace de tu Google Sheet:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualSheetId}
                    onChange={(e) => setManualSheetId(e.target.value)}
                    placeholder="Ej: 1BxiMVs0XRA5nFMdKvBdBZjgmUU..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveManualId}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Vincular
                  </button>
                </div>
              </div>

            </div>

            {config.spreadsheetId && (
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">ID de Hoja Activa:</span>
                  <code className="text-emerald-400 font-mono font-bold">
                    {config.spreadsheetId}
                  </code>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  <span>Abrir en Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* METODO 2: Google Apps Script Web App (Para formularios públicos o HTML autónomo) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Opción B: Webhook con Google Apps Script (Ideal para el archivo HTML público)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Permite que cualquier aprendiz o visitante envíe la encuesta desde el archivo HTML sin necesidad de que ellos inicien sesión en Google.
            </p>
          </div>
        </div>

        {/* 4 Pasos Visuales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="font-bold text-emerald-700 block mb-1">Paso 1</span>
            <p className="text-slate-600">Abre tu hoja en Google Sheets y entra a <strong>Extensiones &gt; Apps Script</strong>.</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="font-bold text-emerald-700 block mb-1">Paso 2</span>
            <p className="text-slate-600">Borra todo y pega el código que puedes copiar abajo.</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="font-bold text-emerald-700 block mb-1">Paso 3</span>
            <p className="text-slate-600">Haz clic en <strong>Implementar &gt; Nueva implementación &gt; Aplicación web</strong>.</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="font-bold text-emerald-700 block mb-1">Paso 4</span>
            <p className="text-slate-600">Configura acceso: <strong>"Cualquier persona"</strong> y copia la URL resultante.</p>
          </div>
        </div>

        {/* Código Apps Script para Copiar */}
        <div className="relative">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-700">
              Código Google Apps Script (Código.gs):
            </span>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? '¡Código copiado!' : 'Copiar código Apps Script'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-56">
            <code>{appsScriptCode}</code>
          </pre>
        </div>

        {/* Input para guardar la URL Web App */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
          <label className="block text-xs font-bold text-emerald-950">
            URL de la Aplicación Web generada en Apps Script:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={appsScriptUrlInput}
              onChange={(e) => setAppsScriptUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 px-3 py-2 text-xs border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveWebhook}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Guardar URL
            </button>
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {isTestingWebhook ? 'Probando...' : 'Probar Envío'}
            </button>
          </div>

          {webhookTestStatus && (
            <p className="text-xs font-medium text-emerald-800 mt-2">
              {webhookTestStatus}
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
