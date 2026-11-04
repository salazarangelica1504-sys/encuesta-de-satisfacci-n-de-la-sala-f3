/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { SurveyForm } from './components/SurveyForm';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { GoogleSheetsSettings } from './components/GoogleSheetsSettings';
import { HtmlExportView } from './components/HtmlExportView';
import { SurveyResponse, GoogleSheetsConfig } from './types/survey';
import { INITIAL_RESPONSES } from './data/seedResponses';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/googleAuth';
import { appendResponseToGoogleSheet, sendToAppsScriptWebhook } from './services/googleSheets';

const LOCAL_STORAGE_KEY = 'encuesta_f3_buga_responses_v1';
const CONFIG_STORAGE_KEY = 'encuesta_f3_buga_config_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'survey' | 'analytics' | 'sheets' | 'html'>('survey');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Responses state initialized with existing responses from attachment or localStorage
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error cargando respuestas locales:', e);
    }
    return INITIAL_RESPONSES;
  });

  // Google Sheets configuration
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error cargando config:', e);
    }
    return {
      spreadsheetId: '',
      spreadsheetName: '',
      sheetName: 'Respuestas',
      appsScriptUrl: '',
      mode: 'local',
    };
  });

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save responses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(responses));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }, [responses]);

  // Save config to localStorage
  const handleUpdateConfig = (newCfg: GoogleSheetsConfig) => {
    setSheetsConfig(newCfg);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newCfg));
    } catch (e) {
      console.error('Error guardando config:', e);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Error de autenticación con Google:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
  };

  // Add new response and sync to Google Sheets
  const handleAddResponse = async (
    newResponse: SurveyResponse
  ): Promise<{ syncedToSheets: boolean; error?: string }> => {
    let synced = false;
    let syncError: string | undefined;

    // 1. Try Google Sheets API with OAuth if connected
    if (accessToken && sheetsConfig.spreadsheetId) {
      try {
        const res = await appendResponseToGoogleSheet(
          sheetsConfig.spreadsheetId,
          newResponse,
          accessToken,
          sheetsConfig.sheetName || 'Respuestas'
        );
        if (res.success) {
          synced = true;
        } else {
          syncError = res.error;
        }
      } catch (err: any) {
        syncError = err.message;
      }
    }

    // 2. Try Apps Script Webhook if configured
    if (!synced && sheetsConfig.appsScriptUrl) {
      try {
        const res = await sendToAppsScriptWebhook(sheetsConfig.appsScriptUrl, newResponse);
        if (res.success) {
          synced = true;
        } else {
          syncError = res.message;
        }
      } catch (err: any) {
        syncError = err.message;
      }
    }

    const finalizedResponse: SurveyResponse = {
      ...newResponse,
      syncedToSheets: synced,
    };

    setResponses((prev) => [finalizedResponse, ...prev]);

    return {
      syncedToSheets: synced,
      error: syncError,
    };
  };

  // Sync all pending responses to Google Sheets
  const handleSyncAllPending = async () => {
    const token = accessToken || (await getAccessToken());
    if (!token && !sheetsConfig.appsScriptUrl) {
      alert('Conecta primero tu cuenta de Google o configura la URL de Apps Script en la pestaña Google Sheets.');
      setActiveTab('sheets');
      return;
    }

    setIsSyncingAll(true);
    try {
      const updatedList = [...responses];
      let syncCount = 0;

      for (let i = 0; i < updatedList.length; i++) {
        if (!updatedList[i].syncedToSheets) {
          if (token && sheetsConfig.spreadsheetId) {
            const res = await appendResponseToGoogleSheet(
              sheetsConfig.spreadsheetId,
              updatedList[i],
              token,
              sheetsConfig.sheetName || 'Respuestas'
            );
            if (res.success) {
              updatedList[i].syncedToSheets = true;
              syncCount++;
            }
          } else if (sheetsConfig.appsScriptUrl) {
            const res = await sendToAppsScriptWebhook(sheetsConfig.appsScriptUrl, updatedList[i]);
            if (res.success) {
              updatedList[i].syncedToSheets = true;
              syncCount++;
            }
          }
        }
      }

      setResponses(updatedList);
      alert(`¡Sincronización completada! ${syncCount} respuesta(s) enviadas a Google Sheets.`);
    } catch (err: any) {
      alert('Error sincronizando respuestas: ' + err.message);
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        hasSheetsLinked={Boolean(sheetsConfig.spreadsheetId || sheetsConfig.appsScriptUrl)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        totalResponses={responses.length}
      />

      {/* Main Content Views */}
      <main className="flex-1">
        {activeTab === 'survey' && (
          <SurveyForm
            onAddResponse={handleAddResponse}
            sheetsConfig={sheetsConfig}
            isLoggedInGoogle={Boolean(currentUser)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            responses={responses}
            sheetsConfig={sheetsConfig}
            onSyncAllPending={handleSyncAllPending}
            isSyncing={isSyncingAll}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsSettings
            config={sheetsConfig}
            onUpdateConfig={handleUpdateConfig}
            currentUser={currentUser}
            accessToken={accessToken}
            onLogin={handleLogin}
          />
        )}

        {activeTab === 'html' && (
          <HtmlExportView appsScriptUrl={sheetsConfig.appsScriptUrl} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SENA • Regional Valle</span>
            <span>—</span>
            <span>Centro Agropecuario de Buga (CAB)</span>
          </div>
          <p className="text-slate-400">
            Ambiente de Cómputo F3 • Sistema de Encuestas y Sincronización Google Sheets
          </p>
        </div>
      </footer>
    </div>
  );
}
