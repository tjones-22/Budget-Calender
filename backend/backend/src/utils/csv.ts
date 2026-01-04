import { appendFile, readFile } from 'fs/promises';

export type CsvRow = string[];

export async function readCsv(filePath: string): Promise<CsvRow[]> {
  const content = await readFile(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => parseCsvLine(line));
}

export async function appendCsvLine(
  filePath: string,
  values: string[],
): Promise<void> {
  const line = values.map((value) => escapeCsv(value)).join(',');
  await appendFile(filePath, `${line}\n`, 'utf8');
}

export function parseCsvLine(line: string): CsvRow {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function escapeCsv(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
