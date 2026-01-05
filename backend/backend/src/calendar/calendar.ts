export type DayEntry = {
  date: string;
  bills: { name: string; amount: number; recurringId?: string }[];
  paydays: { name: string; amount: number; recurringId?: string }[];
  purchases: { name: string; amount: number; recurringId?: string }[];
  savings: { name: string; amount: number; recurringId?: string }[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

type EventEntry = {
  bills: { name: string; amount: number; recurringId?: string }[];
  paydays: { name: string; amount: number; recurringId?: string }[];
  purchases: { name: string; amount: number; recurringId?: string }[];
  savings: { name: string; amount: number; recurringId?: string }[];
};

export class CalendarMonth {
  readonly matrix: DayEntry[][];

  constructor(year: number, monthIndex: number, events: Map<string, EventEntry>) {
    const firstOfMonth = new Date(year, monthIndex, 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const weeks: DayEntry[][] = [];
    const cursor = new Date(start);

    for (let week = 0; week < 6; week += 1) {
      const row: DayEntry[] = [];
      for (let day = 0; day < 7; day += 1) {
        const date = formatDate(cursor);
        const eventEntry = events.get(date);
        const isToday =
          cursor.getFullYear() === new Date().getFullYear() &&
          cursor.getMonth() === new Date().getMonth() &&
          cursor.getDate() === new Date().getDate();
        row.push({
          date,
          bills: eventEntry?.bills ?? [],
          paydays: eventEntry?.paydays ?? [],
          purchases: eventEntry?.purchases ?? [],
          savings: eventEntry?.savings ?? [],
          isCurrentMonth: cursor.getMonth() === monthIndex,
          isToday,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(row);
    }

    this.matrix = weeks;
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
