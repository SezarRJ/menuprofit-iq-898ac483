/**
 * Import validation utilities for Sales CSV/XLSX imports.
 * Defends against: formula injection, encoding issues, invalid data, oversized files.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 50000;
const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedRows: Record<string, string | number>[];
}

/** Sanitize a cell value to prevent formula injection */
function sanitizeCell(value: any): string | number {
  if (value == null) return "";
  const str = String(value).trim();
  // Strip formula injection prefixes
  if (FORMULA_PREFIXES.some(p => str.startsWith(p))) {
    return "'" + str;
  }
  return str;
}

/** Validate a date string (supports multiple formats) */
function isValidDate(value: any): boolean {
  if (!value) return false;
  const str = String(value).trim();
  // ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return !isNaN(Date.parse(str));
  // DD/MM/YYYY or MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return true;
  // Excel serial date number
  if (/^\d+$/.test(str) && Number(str) > 40000 && Number(str) < 60000) return true;
  return false;
}

/** Validate quantity */
function isValidQuantity(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 999999;
}

/** Validate file size */
export function validateFileSize(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `حجم الملف (${(file.size / 1024 / 1024).toFixed(1)} ميجا) يتجاوز الحد المسموح (10 ميجا)`;
  }
  return null;
}

/** Validate parsed import data */
export function validateImportData(
  rows: Record<string, any>[],
  dateCol: string,
  dishCol: string,
  qtyCol: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedRows: Record<string, string | number>[] = [];

  if (rows.length === 0) {
    errors.push("الملف فارغ أو لا يحتوي على بيانات صالحة");
    return { valid: false, errors, warnings, sanitizedRows };
  }

  if (rows.length > MAX_ROWS) {
    errors.push(`الملف يحتوي على ${rows.length.toLocaleString()} صف، الحد الأقصى هو ${MAX_ROWS.toLocaleString()}`);
    return { valid: false, errors, warnings, sanitizedRows };
  }

  // Validate required columns exist
  const headers = Object.keys(rows[0]);
  if (!headers.includes(dateCol)) errors.push(`عمود التاريخ "${dateCol}" غير موجود`);
  if (!headers.includes(dishCol)) errors.push(`عمود اسم الصحن "${dishCol}" غير موجود`);
  if (!headers.includes(qtyCol)) errors.push(`عمود الكمية "${qtyCol}" غير موجود`);

  if (errors.length > 0) return { valid: false, errors, warnings, sanitizedRows };

  let invalidDates = 0;
  let negativeQty = 0;
  let emptyDish = 0;
  const seenRows = new Set<string>();
  let duplicates = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const date = row[dateCol];
    const dish = row[dishCol];
    const qty = row[qtyCol];

    // Sanitize all values
    const sanitized: Record<string, string | number> = {};
    for (const [key, val] of Object.entries(row)) {
      sanitized[key] = sanitizeCell(val);
    }

    // Validate date
    if (date && !isValidDate(date)) {
      invalidDates++;
    }

    // Validate dish name
    const dishStr = String(dish ?? "").trim();
    if (!dishStr) {
      emptyDish++;
      continue; // Skip rows with empty dish names
    }

    // Validate quantity
    const qtyNum = Number(qty);
    if (isNaN(qtyNum) || qtyNum < 0) {
      negativeQty++;
      sanitized[qtyCol] = 0; // Default to 0
    }

    // Check duplicates
    const rowKey = `${date}-${dish}-${qty}`;
    if (seenRows.has(rowKey)) {
      duplicates++;
    }
    seenRows.add(rowKey);

    sanitizedRows.push(sanitized);
  }

  if (invalidDates > 0) warnings.push(`${invalidDates} صف يحتوي على تاريخ غير صالح`);
  if (negativeQty > 0) warnings.push(`${negativeQty} صف يحتوي على كمية سالبة (تم تصحيحها إلى 0)`);
  if (emptyDish > 0) warnings.push(`تم تجاهل ${emptyDish} صف بدون اسم صحن`);
  if (duplicates > 0) warnings.push(`تم اكتشاف ${duplicates} صف مكرر`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedRows,
  };
}
