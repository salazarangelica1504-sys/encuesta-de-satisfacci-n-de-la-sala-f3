import React, { useState } from 'react';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  FileCode, 
  Share2, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { generateStandaloneHtml } from './StandaloneHtmlGenerator';

interface HtmlExportViewProps {
  appsScriptUrl?: string;
}

export const HtmlExportView: React.FC<HtmlExportViewProps> = ({
  appsScriptUrl = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customUrl, setCustomUrl] = useState(appsScriptUrl);

  const htmlCode = generateStandaloneHtml(customUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'formulario_sala_f3_buga.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <FileCode className="w-6 h-6" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Código HTML Autónomo para Descargar
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Aquí tienes el archivo <strong>.html</strong> autónomo con las 10 preguntas y la integración con Google Sheets. Puedes descargarlo, abrirlo directamente en cualquier navegador o compartirlo con los aprendices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar formulario_f3_buga.html</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>

        {/* Script URL embeder */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            URL Google Apps Script incrustada:
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec (opcional)"
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview if active */}
      {showPreview && (
        <div className="bg-white rounded-2xl border border-emerald-300 p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              Vista Previa en Vivo del Formulario HTML
            </span>
            <span className="text-[11px] text-slate-400">
              Renderizado directo del código HTML
            </span>
          </div>
          <iframe
            srcDoc={htmlCode}
            title="Vista previa del formulario HTML"
            className="w-full h-[650px] rounded-xl border border-slate-200 bg-white"
          />
        </div>
      )}

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
            1
          </span>
          <h4 className="font-bold text-slate-900">Uso local e inmediato</h4>
          <p className="text-slate-500 leading-relaxed">
            Descarga el archivo <code>.html</code> y ábrelo con doble clic en Chrome, Edge o Firefox. Funciona sin necesidad de instalar ningún servidor.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
            2
          </span>
          <h4 className="font-bold text-slate-900">Incrustar en intranet o web</h4>
          <p className="text-slate-500 leading-relaxed">
            Puedes subirlo a cualquier servidor web o incrustarlo con una etiqueta <code>&lt;iframe src="formulario_f3.html"&gt;&lt;/iframe&gt;</code> en tu portal institucional.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
            3
          </span>
          <h4 className="font-bold text-slate-900">Envío directo a Google Sheets</h4>
          <p className="text-slate-500 leading-relaxed">
            Las respuestas se envían en tiempo real mediante <code>fetch(POST)</code> a tu hoja de cálculo, sin que el aprendiz deba tener cuenta de Google.
          </p>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="px-5 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">
              formulario_sala_f3_buga.html
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar todo'}</span>
          </button>
        </div>

        <div className="p-5 max-h-[500px] overflow-y-auto">
          <pre className="text-xs font-mono text-emerald-300/90 leading-relaxed select-all">
            <code>{htmlCode}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};
