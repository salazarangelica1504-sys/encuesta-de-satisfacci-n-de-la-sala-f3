export interface SurveyResponse {
  id: string;
  timestamp: string; // ISO string or formatted date
  // 1. Relación con el Centro
  role: 'Aprendiz' | 'Instructor' | 'Administrativo' | 'Egresado' | 'Visitante / Externo';
  // 2. Frecuencia de uso
  frequency: 'Todos los días' | '2 a 3 veces por semana' | 'Una vez por semana' | 'Ocasionalmente' | 'Primera vez';
  // 3. Propósito principal
  purpose: 'Formación académica / Clases' | 'Investigaciones y proyectos' | 'Evaluaciones y pruebas' | 'Trabajo autónomo y consultas';
  // 4. Estado y funcionamiento de equipos (1-5)
  equipmentRating: number;
  // 5. Calidad de conectividad e Internet (1-5)
  internetRating: number;
  // 6. Condiciones ambientales (iluminación, ventilación, clima) (1-5)
  environmentRating: number;
  // 7. Comodidad y mobiliario (sillas, mesas, espacio) (1-5)
  furnitureRating: number;
  // 8. Satisfacción general (1-5)
  overallSatisfaction: number;
  // 9. Recomendarías el ambiente F3
  recommendation: 'Sí' | 'Tal vez' | 'No';
  // 10. Aspectos a mejorar (múltiples) y sugerencias abiertas
  aspectsToImprove: string[]; // e.g. ["Velocidad de Internet", "Equipos / Computadores", "Aire acondicionado"]
  suggestions: string; // Open comments
  syncedToSheets?: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetName?: string;
  sheetName: string;
  appsScriptUrl?: string;
  mode: 'oauth' | 'webhook' | 'both' | 'local';
}
