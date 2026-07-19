
// this is to help make more sense when adding dates to all the functions used on the server 


// Returns midnight for the provided date in the server's local timezone.
export function getStartOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


// Returns midnight for the day after the provided date.
// Useful as an exclusive upper bound in date queries.
export function getStartOfNextDay(date = new Date()) {
  const startOfDay = getStartOfDay(date);

  return new Date(
    startOfDay.getFullYear(),
    startOfDay.getMonth(),
    startOfDay.getDate() + 1,
  );
}



// Returns today's start and tomorrow's start.
// Use this to query records scheduled for today.
export function getTodayRange() {
  return {
    startOfToday: getStartOfDay(),
    startOfTomorrow: getStartOfNextDay(),
  };
}

// Returns the start and exclusive end of a specific calendar day.
// The month argument uses normal human numbering
export function getDayRange(year: number, month: number, day: number) {
  const startOfDay = new Date(year, month - 1, day);

  return {
    startOfDay,
    startOfNextDay: getStartOfNextDay(startOfDay),
  };
}

// Returns a Sunday-through-Saturday week range for the provided date.
// startOfNextWeek is exclusive, so queries should use gte startOfWeek and lt startOfNextWeek.
export function getCurrentWeekRange(date = new Date()) {
  const dayOfWeek = date.getDay();

  const startOfWeek = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - dayOfWeek,
  );

  const startOfNextWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 7,
  );

  return {
    startOfWeek,
    startOfNextWeek,
  };
}

// Returns the start and exclusive end of a specific month.
// The month argument uses normal human numbering: January = 1, December = 12.
export function getMonthRange(year: number, month: number) {
  return {
    startOfMonth: new Date(year, month - 1, 1),
    startOfNextMonth: new Date(year, month, 1),
  };
}

// Returns the start and exclusive end of the month containing the provided date.
export function getCurrentMonthRange(date = new Date()) {
  return getMonthRange(date.getFullYear(), date.getMonth() + 1);
}

// Converts an HTML date input value, like "2026-07-18", into a local Date.
// Avoids the UTC shift that can happen with new Date("YYYY-MM-DD").
export function parseLocalDate(dateValue: string) {
  const [yearValue, monthValue, dayValue] = dateValue.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
