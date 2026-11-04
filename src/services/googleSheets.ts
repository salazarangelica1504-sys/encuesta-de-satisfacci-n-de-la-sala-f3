import { SurveyResponse } from '../types/survey';

export const SURVEY_HEADERS = [
  'Marca temporal',
  '¿Cuál es tu relación con el Centro Agropecuario de Buga?',
  '¿Con qué frecuencia utilizas el ambiente F3?',
  '¿Para qué utilizas principalmente el ambiente F3?',
  'Disponibilidad y estado de los equipos (1-5)',
  'Calidad de conectividad e Internet (1-5)',
  'Condiciones ambientales (iluminación, ventilación, clima) (1-5)',
  'Comodidad y estado del mobiliario (sillas, mesas) (1-5)',
  'En general, ¿qué tan satisfecho estás con el ambiente F3? (1-5)',
  '¿Recomendarías el ambiente F3 para realizar actividades de formación?',
  '¿Qué aspectos consideras que necesitan mejorar?',
  '¿Qué sugerencias tienes para mejorar el ambiente F3?',
];

export function formatResponseToRow(res: SurveyResponse): (string | number)[] {
  return [
    res.timestamp,
    res.role,
    res.frequency,
    res.purpose,
    res.equipmentRating,
    res.internetRating,
    res.environmentRating,
    res.furnitureRating,
    res.overallSatisfaction,
    res.recommendation,
    res.aspectsToImprove.length > 0 ? res.aspectsToImprove.join('; ') : 'Ninguno',
    res.suggestions || 'Sin comentarios adicionales',
  ];
}

/**
 * Appends a survey response to a Google Spreadsheet using the Google Sheets REST API v4.
 */
export async function appendResponseToGoogleSheet(
  spreadsheetId: string,
  response: SurveyResponse,
  accessToken: string,
  sheetName: string = 'Respuestas'
): Promise<{ success: boolean; updatedRange?: string; error?: string }> {
  try {
    const row = formatResponseToRow(response);
    const range = `${sheetName}!A:L`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(
        errJson?.error?.message || `Error de Google Sheets API: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    return { success: true, updatedRange: data?.updates?.updatedRange };
  } catch (error: any) {
    console.error('Error enviando fila a Google Sheets:', error);
    return { success: false, error: error.message || 'Error desconocido al enviar a Google Sheets' };
  }
}

/**
 * Creates a brand new Google Sheet in the user's Google Drive with headers pre-populated.
 */
export async function createSurveySpreadsheet(
  accessToken: string,
  title: string = 'Encuesta de satisfacción sobre la sala F3 (Respuestas)'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Respuestas',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: SURVEY_HEADERS.map((h) => ({
                    userEnteredValue: { stringValue: h },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.22, green: 0.66, blue: 0.0, alpha: 1 }, // SENA green
                    },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => null);
    throw new Error(
      errJson?.error?.message || `Error al crear la hoja de cálculo: ${response.statusText}`
    );
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

/**
 * Sends survey data to a Google Apps Script Web App URL (webhook mode).
 * Works without respondent authentication.
 */
export async function sendToAppsScriptWebhook(
  webhookUrl: string,
  response: SurveyResponse
): Promise<{ success: boolean; message?: string }> {
  try {
    const payload = {
      timestamp: response.timestamp,
      role: response.role,
      frequency: response.frequency,
      purpose: response.purpose,
      equipmentRating: response.equipmentRating,
      internetRating: response.internetRating,
      environmentRating: response.environmentRating,
      furnitureRating: response.furnitureRating,
      overallSatisfaction: response.overallSatisfaction,
      recommendation: response.recommendation,
      aspectsToImprove: response.aspectsToImprove.join(', '),
      suggestions: response.suggestions,
      rowValues: formatResponseToRow(response),
    };

    // Google Apps Script redirects on POST, which in browsers creates an opaque response with mode: 'no-cors'.
    // We send via standard fetch with mode: 'no-cors' so browser doesn't block it.
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return { success: true, message: 'Enviado correctamente a Google Apps Script' };
  } catch (error: any) {
    console.error('Error al enviar al Webhook de Google Apps Script:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Generates the Google Apps Script code to copy and paste into Google Sheets.
 */
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * Código de Google Apps Script para registrar respuestas del formulario HTML
 * de la Sala de Cómputo F3 - Centro Agropecuario de Buga.
 * 
 * Instrucciones:
 * 1. En tu hoja de cálculo de Google, ve a: Extensiones > Apps Script
 * 2. Borra el código existente y pega este archivo completo.
 * 3. Haz clic en "Guardar" (icono de disquete).
 * 4. Haz clic en "Implementar" > "Nueva implementación".
 * 5. Selecciona Tipo: "Aplicación web".
 * 6. Configura:
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 7. Haz clic en "Implementar", autoriza los permisos y copia la URL de la aplicación web.
 * 8. Pega esa URL en el formulario HTML. ¡Listo!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la hoja está vacía, creamos los encabezados
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Marca temporal",
        "¿Cuál es tu relación con el Centro Agropecuario de Buga?",
        "¿Con qué frecuencia utilizas el ambiente F3?",
        "¿Para qué utilizas principalmente el ambiente F3?",
        "Disponibilidad y estado de los equipos (1-5)",
        "Calidad de conectividad e Internet (1-5)",
        "Condiciones ambientales (iluminación, ventilación, clima) (1-5)",
        "Comodidad y estado del mobiliario (sillas, mesas) (1-5)",
        "En general, ¿qué tan satisfecho estás con el ambiente F3? (1-5)",
        "¿Recomendarías el ambiente F3 para realizar actividades de formación?",
        "¿Qué aspectos consideras que necesitan mejorar?",
        "¿Qué sugerencias tienes para mejorar el ambiente F3?"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#39A900").setFontColor("#FFFFFF");
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      data = e.parameter;
    }

    var row = data.rowValues || [
      data.timestamp || new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
      data.role || "",
      data.frequency || "",
      data.purpose || "",
      data.equipmentRating || "",
      data.internetRating || "",
      data.environmentRating || "",
      data.furnitureRating || "",
      data.overallSatisfaction || "",
      data.recommendation || "",
      data.aspectsToImprove || "",
      data.suggestions || ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "activo", servicio: "Encuesta Sala F3 - Centro Agropecuario Buga" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}
