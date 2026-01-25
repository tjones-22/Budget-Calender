import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { escapeCsv, parseCsvLine } from '../utils/csv';
import { CalendarMonth, formatDate } from './calendar';

type CalendarEvent = {
  bills: { name: string; amount: number; recurringId?: string }[];
  paydays: { name: string; amount: number; recurringId?: string }[];
  purchases: { name: string; amount: number; recurringId?: string }[];
  savings: { name: string; amount: number; recurringId?: string }[];
};

type RecurringRule = {
  groupId: string;
  id: string;
  type: 'bill' | 'payday' | 'purchase' | 'savings';
  name: string;
  amount: number;
  startDate: string;
  cadence: 'weekly' | 'biweekly' | 'monthly';
  monthsCount: number | null;
  forever: boolean;
  exceptions: string[];
};

@Injectable()
export class CalendarService {
  private readonly filePath = path.join(process.cwd(), 'db', 'calender.csv');
  private readonly recurringFilePath = path.join(
    process.cwd(),
    'db',
    'recurring.csv',
  );

  async getMonth(year: number, monthIndex: number, groupId: string) {
    const eventsByGroup = await this.readEventsByGroup();
    const events = this.getGroupEvents(eventsByGroup, groupId);
    const recurringRules = await this.readRecurringRulesForGroup(groupId);
    const recurringEvents = this.expandRecurringForMonth(
      year,
      monthIndex,
      recurringRules,
    );
    const mergedEvents = this.mergeEvents(events, recurringEvents);
    const calendar = new CalendarMonth(year, monthIndex, mergedEvents);
    return calendar.matrix;
  }

  async upsertDay(
    date: string,
    groupId: string,
    bills: { name: string; amount: number }[],
    paydays: { name: string; amount: number }[],
    purchases: { name: string; amount: number }[],
    savings: { name: string; amount: number }[] = [],
  ) {
    const eventsByGroup = await this.readEventsByGroup();
    const events = this.getGroupEvents(eventsByGroup, groupId);
    events.set(date, { bills, paydays, purchases, savings });
    eventsByGroup.set(groupId, events);
    await this.writeEventsByGroup(eventsByGroup);
  }

  async createRecurringRule(
    groupId: string,
    rule: Omit<RecurringRule, 'id' | 'exceptions' | 'groupId'>,
  ): Promise<RecurringRule> {
    const existing = await this.readRecurringRules();
    const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nextRule: RecurringRule = { ...rule, id, groupId, exceptions: [] };
    existing.push(nextRule);
    await this.writeRecurringRules(existing);
    return nextRule;
  }

  async deleteRecurring(
    groupId: string,
    recurringId: string,
    date: string,
    scope: 'one' | 'all',
  ) {
    const rules = await this.readRecurringRules();
    const index = rules.findIndex(
      (rule) => rule.id === recurringId && rule.groupId === groupId,
    );
    if (index === -1) {
      return;
    }
    if (scope === 'all') {
      rules.splice(index, 1);
      await this.writeRecurringRules(rules);
      return;
    }
    const rule = rules[index];
    if (!rule.exceptions.includes(date)) {
      rule.exceptions.push(date);
    }
    await this.writeRecurringRules(rules);
  }

  private async readEventsByGroup(): Promise<
    Map<string, Map<string, CalendarEvent>>
  > {
    try {
      const content = await readFile(this.filePath, 'utf8');
      if (!content.trim()) {
        return new Map();
      }
      const rows = content
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => parseCsvLine(line));
      const eventsByGroup = new Map<string, Map<string, CalendarEvent>>();
      for (const row of rows) {
        const { groupId, date, billsJson, paydaysJson, purchasesJson, savingsJson } =
          this.parseEventRow(row);
        const billsRaw = billsJson ? (JSON.parse(billsJson) as unknown[]) : [];
        const paydaysRaw = paydaysJson
          ? (JSON.parse(paydaysJson) as unknown[])
          : [];
        const purchasesRaw = purchasesJson
          ? (JSON.parse(purchasesJson) as unknown[])
          : [];
        const savingsRaw = savingsJson
          ? (JSON.parse(savingsJson) as unknown[])
          : [];
        const bills = this.normalizeAmountItems(billsRaw);
        const paydays = this.normalizeAmountItems(paydaysRaw);
        const purchases = this.normalizeAmountItems(purchasesRaw);
        const savings = this.normalizeAmountItems(savingsRaw);
        const groupEvents =
          eventsByGroup.get(groupId) ?? new Map<string, CalendarEvent>();
        groupEvents.set(date, { bills, paydays, purchases, savings });
        eventsByGroup.set(groupId, groupEvents);
      }
      return eventsByGroup;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return new Map();
      }
      throw error;
    }
  }

  private async writeEventsByGroup(
    eventsByGroup: Map<string, Map<string, CalendarEvent>>,
  ) {
    const lines: string[] = [];
    for (const [groupId, events] of eventsByGroup) {
      for (const [date, event] of events) {
        const row = [
          groupId,
          date,
          JSON.stringify(event.bills ?? []),
          JSON.stringify(event.paydays ?? []),
          JSON.stringify(event.purchases ?? []),
          JSON.stringify(event.savings ?? []),
        ]
          .map((value) => escapeCsv(value))
          .join(',');
        lines.push(row);
      }
    }
    const output = lines.length > 0 ? `${lines.join('\n')}\n` : '';
    await writeFile(this.filePath, output, 'utf8');
  }

  private async readRecurringRules(): Promise<RecurringRule[]> {
    try {
      const content = await readFile(this.recurringFilePath, 'utf8');
      if (!content.trim()) {
        return [];
      }
      const rows = content
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => parseCsvLine(line));
      return rows.map((row) => {
        const hasGroupId = row.length >= 10;
        const [
          groupIdValue,
          idValue,
          typeValue,
          nameValue,
          amountValue,
          startDateValue,
          cadenceValue,
          monthsCountValue,
          foreverValue,
          exceptionsJson,
        ] = hasGroupId
          ? row
          : [
              'default',
              row[0],
              row[1],
              row[2],
              row[3],
              row[4],
              row[5],
              row[6],
              row[7],
              row[8],
            ];
        const amount = Number(amountValue ?? 0);
        const monthsCount = monthsCountValue
          ? Number(monthsCountValue)
          : null;
        const exceptions = exceptionsJson
          ? (JSON.parse(exceptionsJson) as string[])
          : [];
        return {
          groupId: groupIdValue ?? 'default',
          id: idValue ?? '',
          type: (typeValue as RecurringRule['type']) ?? 'bill',
          name: nameValue ?? '',
          amount: Number.isFinite(amount) ? amount : 0,
          startDate: startDateValue ?? '',
          cadence: (cadenceValue as RecurringRule['cadence']) ?? 'monthly',
          monthsCount: Number.isFinite(monthsCount) ? monthsCount : null,
          forever: foreverValue === 'true',
          exceptions: Array.isArray(exceptions) ? exceptions : [],
        };
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeRecurringRules(rules: RecurringRule[]) {
    const lines = rules.map((rule) =>
      [
        rule.groupId,
        rule.id,
        rule.type,
        rule.name,
        String(rule.amount),
        rule.startDate,
        rule.cadence,
        rule.monthsCount ? String(rule.monthsCount) : '',
        String(rule.forever),
        JSON.stringify(rule.exceptions ?? []),
      ]
        .map((value) => escapeCsv(value))
        .join(','),
    );
    const output = lines.length > 0 ? `${lines.join('\n')}\n` : '';
    await writeFile(this.recurringFilePath, output, 'utf8');
  }

  async getBalanceForDate(
    groupId: string,
    date: string,
    baseFunds: number,
    baseSavings: number,
  ) {
    const endDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(endDate.getTime())) {
      return { funds: baseFunds, savings: baseSavings };
    }

    const eventsByGroup = await this.readEventsByGroup();
    const events = this.getGroupEvents(eventsByGroup, groupId);
    const recurringRules = await this.readRecurringRulesForGroup(groupId);
    const recurringEvents = this.expandRecurringUpToDate(recurringRules, endDate);
    const mergedEvents = this.mergeEvents(events, recurringEvents);

    const endTime = endDate.getTime();
    let funds = baseFunds;
    let savings = baseSavings;
    for (const [eventDate, event] of mergedEvents) {
      const currentTime = new Date(`${eventDate}T00:00:00`).getTime();
      if (Number.isNaN(currentTime) || currentTime > endTime) {
        continue;
      }
      const paydaysTotal = event.paydays.reduce((sum, item) => sum + item.amount, 0);
      const billsTotal = event.bills.reduce((sum, item) => sum + item.amount, 0);
      const purchasesTotal = event.purchases.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const savingsTotal = event.savings.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      funds += paydaysTotal - billsTotal - purchasesTotal - savingsTotal;
      savings += savingsTotal;
    }

    return { funds, savings };
  }

  private async readRecurringRulesForGroup(
    groupId: string,
  ): Promise<RecurringRule[]> {
    const rules = await this.readRecurringRules();
    return rules.filter((rule) => rule.groupId === groupId);
  }

  private mergeEvents(
    base: Map<string, CalendarEvent>,
    recurring: Map<string, CalendarEvent>,
  ) {
    const merged = new Map<string, CalendarEvent>();
    for (const [date, event] of base) {
      merged.set(date, {
        bills: [...(event.bills ?? [])],
        paydays: [...(event.paydays ?? [])],
        purchases: [...(event.purchases ?? [])],
        savings: [...(event.savings ?? [])],
      });
    }
    for (const [date, event] of recurring) {
      const current = merged.get(date) ?? {
        bills: [],
        paydays: [],
        purchases: [],
        savings: [],
      };
      current.bills.push(...(event.bills ?? []));
      current.paydays.push(...(event.paydays ?? []));
      current.purchases.push(...(event.purchases ?? []));
      current.savings.push(...(event.savings ?? []));
      merged.set(date, current);
    }
    return merged;
  }

  private expandRecurringUpToDate(
    rules: RecurringRule[],
    endDate: Date,
  ) {
    const result = new Map<string, CalendarEvent>();
    const endTime = endDate.getTime();
    for (const rule of rules) {
      const startDate = new Date(`${rule.startDate}T00:00:00`);
      if (Number.isNaN(startDate.getTime())) {
        continue;
      }
      if (startDate.getTime() > endTime) {
        continue;
      }

      let limitEnd = endTime;
      if (!rule.forever && rule.monthsCount && rule.monthsCount > 0) {
        const startMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          1,
        );
        const endMonth = new Date(
          startMonth.getFullYear(),
          startMonth.getMonth() + rule.monthsCount,
          0,
        );
        limitEnd = Math.min(limitEnd, endMonth.getTime());
      }

      const exceptions = new Set(rule.exceptions);
      const item = { name: rule.name, amount: rule.amount, recurringId: rule.id };

      if (rule.cadence === 'monthly') {
        const startMonthIndex = startDate.getFullYear() * 12 + startDate.getMonth();
        const endMonthIndex =
          new Date(limitEnd).getFullYear() * 12 + new Date(limitEnd).getMonth();
        for (let index = startMonthIndex; index <= endMonthIndex; index += 1) {
          const year = Math.floor(index / 12);
          const monthIndex = index % 12;
          const day = this.clampDay(year, monthIndex, startDate.getDate());
          const candidate = new Date(year, monthIndex, day);
          const candidateTime = candidate.getTime();
          if (candidateTime < startDate.getTime() || candidateTime > limitEnd) {
            continue;
          }
          const date = formatDate(candidate);
          if (exceptions.has(date)) {
            continue;
          }
          const entry = result.get(date) ?? {
            bills: [],
            paydays: [],
            purchases: [],
            savings: [],
          };
          if (rule.type === 'bill') {
            entry.bills.push(item);
          } else if (rule.type === 'payday') {
            entry.paydays.push(item);
          } else if (rule.type === 'purchase') {
            entry.purchases.push(item);
          } else {
            entry.savings.push(item);
          }
          result.set(date, entry);
        }
        continue;
      }

      const intervalDays = rule.cadence === 'biweekly' ? 14 : 7;
      const dayMs = 24 * 60 * 60 * 1000;
      for (
        let time = startDate.getTime();
        time <= limitEnd;
        time += intervalDays * dayMs
      ) {
        const occurrence = new Date(time);
        const date = formatDate(occurrence);
        if (exceptions.has(date)) {
          continue;
        }
        const entry = result.get(date) ?? {
          bills: [],
          paydays: [],
          purchases: [],
          savings: [],
        };
        if (rule.type === 'bill') {
          entry.bills.push(item);
        } else if (rule.type === 'payday') {
          entry.paydays.push(item);
        } else if (rule.type === 'purchase') {
          entry.purchases.push(item);
        } else {
          entry.savings.push(item);
        }
        result.set(date, entry);
      }
    }
    return result;
  }

  private expandRecurringForMonth(
    year: number,
    monthIndex: number,
    rules: RecurringRule[],
  ) {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const result = new Map<string, CalendarEvent>();
    for (const rule of rules) {
      const exceptions = new Set(rule.exceptions);
      const occurrences = this.getOccurrencesForMonth(rule, monthStart, monthEnd);
      for (const occurrence of occurrences) {
        const date = formatDate(occurrence);
        if (exceptions.has(date)) {
          continue;
        }
        const entry = result.get(date) ?? {
          bills: [],
          paydays: [],
          purchases: [],
          savings: [],
        };
        const item = { name: rule.name, amount: rule.amount, recurringId: rule.id };
        if (rule.type === 'bill') {
          entry.bills.push(item);
        } else if (rule.type === 'payday') {
          entry.paydays.push(item);
        } else if (rule.type === 'purchase') {
          entry.purchases.push(item);
        } else {
          entry.savings.push(item);
        }
        result.set(date, entry);
      }
    }
    return result;
  }

  private getOccurrencesForMonth(
    rule: RecurringRule,
    monthStart: Date,
    monthEnd: Date,
  ) {
    const startDate = new Date(`${rule.startDate}T00:00:00`);
    if (Number.isNaN(startDate.getTime())) {
      return [];
    }

    const monthStartTime = monthStart.getTime();
    const monthEndTime = monthEnd.getTime();
    let rangeStart = Math.max(startDate.getTime(), monthStartTime);
    let rangeEnd = monthEndTime;

    if (!rule.forever && rule.monthsCount && rule.monthsCount > 0) {
      const startMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1,
      );
      const endMonth = new Date(
        startMonth.getFullYear(),
        startMonth.getMonth() + rule.monthsCount,
        0,
      );
      if (endMonth.getTime() < monthStartTime) {
        return [];
      }
      rangeEnd = Math.min(rangeEnd, endMonth.getTime());
    }

    if (rangeEnd < rangeStart) {
      return [];
    }

    if (rule.cadence === 'monthly') {
      const day = this.clampDay(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        startDate.getDate(),
      );
      const candidate = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );
      const candidateTime = candidate.getTime();
      if (candidateTime >= rangeStart && candidateTime <= rangeEnd) {
        return [candidate];
      }
      return [];
    }

    const intervalDays = rule.cadence === 'biweekly' ? 14 : 7;
    const dayMs = 24 * 60 * 60 * 1000;
    let firstTime = startDate.getTime();
    if (firstTime < rangeStart) {
      const diffDays = Math.floor((rangeStart - firstTime) / dayMs);
      const remainder = diffDays % intervalDays;
      const offsetDays = remainder === 0 ? diffDays : diffDays + (intervalDays - remainder);
      firstTime = startDate.getTime() + offsetDays * dayMs;
    }
    const occurrences: Date[] = [];
    for (let time = firstTime; time <= rangeEnd; time += intervalDays * dayMs) {
      occurrences.push(new Date(time));
    }
    return occurrences;
  }

  private clampDay(year: number, monthIndex: number, day: number) {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return Math.min(day, lastDay);
  }

  private getGroupEvents(
    eventsByGroup: Map<string, Map<string, CalendarEvent>>,
    groupId: string,
  ) {
    return eventsByGroup.get(groupId) ?? new Map<string, CalendarEvent>();
  }

  private parseEventRow(row: string[]) {
    const [first, second, third, fourth, fifth, sixth] = row;
    const looksLikeDate = /^\d{4}-\d{2}-\d{2}$/.test(first ?? '');
    if (looksLikeDate) {
      return {
        groupId: 'default',
        date: first ?? '',
        billsJson: second ?? '',
        paydaysJson: third ?? '',
        purchasesJson: fourth ?? '',
        savingsJson: fifth ?? '',
      };
    }
    return {
      groupId: first ?? 'default',
      date: second ?? '',
      billsJson: third ?? '',
      paydaysJson: fourth ?? '',
      purchasesJson: fifth ?? '',
      savingsJson: sixth ?? '',
    };
  }

  private normalizeAmountItems(
    items: unknown[],
  ): { name: string; amount: number; recurringId?: string }[] {
    return items
      .map((item) => {
        if (typeof item === 'string') {
          return { name: item, amount: 0 };
        }
        if (
          item &&
          typeof item === 'object' &&
          'name' in item &&
          'amount' in item
        ) {
          const name = String((item as { name: unknown }).name);
          const amount = Number((item as { amount: unknown }).amount);
          const recurringValue =
            'recurringId' in item
              ? (item as { recurringId?: unknown }).recurringId
              : undefined;
          const recurringId =
            typeof recurringValue === 'string'
              ? recurringValue.trim() || undefined
              : typeof recurringValue === 'number'
                ? String(recurringValue)
                : undefined;
          return {
            name,
            amount: Number.isFinite(amount) ? amount : 0,
            ...(recurringId ? { recurringId } : {}),
          };
        }
        return null;
      })
      .filter((item): item is { name: string; amount: number } => item !== null);
  }
}
