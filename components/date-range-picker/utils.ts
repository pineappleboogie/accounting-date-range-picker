import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  subDays,
  subWeeks,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  format,
  setMonth,
  setYear,
  isSameDay,
  getMonth,
  getYear,
  getQuarter,
} from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

// Custom preset types
export type PresetMode = "last" | "this";
export type PresetUnit = "days" | "weeks" | "months" | "years";

export interface CustomPreset {
  id: string;
  mode: PresetMode;
  count: number;
  unit: PresetUnit;
  label: string;
  createdAt: number;
}

// Quick presets
export function getLastMonth(): DateRange {
  const lastMonth = subMonths(new Date(), 1);
  return {
    from: startOfMonth(lastMonth),
    to: endOfMonth(lastMonth),
  };
}

export function getLastQuarter(): DateRange {
  const lastQuarter = subQuarters(new Date(), 1);
  return {
    from: startOfQuarter(lastQuarter),
    to: endOfQuarter(lastQuarter),
  };
}

export function getLastYear(): DateRange {
  const lastYear = subYears(new Date(), 1);
  return {
    from: startOfYear(lastYear),
    to: endOfYear(lastYear),
  };
}

export function getYearToDate(): DateRange {
  const now = new Date();
  return {
    from: startOfYear(now),
    to: now,
  };
}

// Calculate date range from a custom preset
export function calculatePresetRange(preset: CustomPreset): DateRange {
  const now = new Date();

  if (preset.mode === "this") {
    // "This" mode: current period
    switch (preset.unit) {
      case "days":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "weeks":
        return { from: startOfWeek(now), to: endOfWeek(now) };
      case "months":
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case "years":
        return { from: startOfYear(now), to: endOfYear(now) };
    }
  } else {
    // "Last" mode: completed periods (accounting convention - excludes today/current period)
    switch (preset.unit) {
      case "days": {
        // "Last 7 days" = 7 days ending yesterday
        const yesterday = subDays(now, 1);
        const startDate = subDays(yesterday, preset.count - 1);
        return { from: startOfDay(startDate), to: endOfDay(yesterday) };
      }
      case "weeks": {
        // "Last 2 weeks" = 2 complete weeks ending last week
        const lastWeek = subWeeks(now, 1);
        const startWeek = subWeeks(lastWeek, preset.count - 1);
        return { from: startOfWeek(startWeek), to: endOfWeek(lastWeek) };
      }
      case "months": {
        // "Last 3 months" = 3 complete months ending last month
        const lastMonth = subMonths(now, 1);
        const startMonth = subMonths(lastMonth, preset.count - 1);
        return { from: startOfMonth(startMonth), to: endOfMonth(lastMonth) };
      }
      case "years": {
        // "Last 2 years" = 2 complete years ending last year
        const lastYear = subYears(now, 1);
        const startYear = subYears(lastYear, preset.count - 1);
        return { from: startOfYear(startYear), to: endOfYear(lastYear) };
      }
    }
  }
}

// Generate a human-readable label for a preset
export function generatePresetLabel(
  mode: PresetMode,
  count: number,
  unit: PresetUnit
): string {
  if (mode === "this") {
    const unitSingular = unit.slice(0, -1);
    return `This ${unitSingular}`;
  } else {
    const unitLabel = count === 1 ? unit.slice(0, -1) : unit;
    return `Last ${count} ${unitLabel}`;
  }
}

// Month selection
export function getMonthRange(year: number, month: number): DateRange {
  const date = setMonth(setYear(new Date(), year), month);
  return {
    from: startOfMonth(date),
    to: endOfMonth(date),
  };
}

// Quarter selection (quarter: 1-4)
export function getQuarterRange(year: number, quarter: number): DateRange {
  // Quarter 1 = months 0-2 (Jan-Mar)
  // Quarter 2 = months 3-5 (Apr-Jun)
  // Quarter 3 = months 6-8 (Jul-Sep)
  // Quarter 4 = months 9-11 (Oct-Dec)
  const startMonth = (quarter - 1) * 3;
  const date = setMonth(setYear(new Date(), year), startMonth);
  return {
    from: startOfQuarter(date),
    to: endOfQuarter(date),
  };
}

// Half-year selection (half: 1 = H1, 2 = H2)
export function getHalfYearRange(year: number, half: 1 | 2): DateRange {
  if (half === 1) {
    // H1: January 1 - June 30
    const startDate = setMonth(setYear(new Date(), year), 0);
    const endDate = setMonth(setYear(new Date(), year), 5);
    return {
      from: startOfMonth(startDate),
      to: endOfMonth(endDate),
    };
  } else {
    // H2: July 1 - December 31
    const startDate = setMonth(setYear(new Date(), year), 6);
    const endDate = setMonth(setYear(new Date(), year), 11);
    return {
      from: startOfMonth(startDate),
      to: endOfMonth(endDate),
    };
  }
}

// Full year selection
export function getYearRange(year: number): DateRange {
  const date = setYear(new Date(), year);
  return {
    from: startOfYear(date),
    to: endOfYear(date),
  };
}

// Format date range for display with smart detection
export function formatDateRange(range: DateRange | undefined): string {
  if (!range) return "";

  const { from, to } = range;
  const fromYear = getYear(from);
  const toYear = getYear(to);

  // Check if it's a full year (Jan 1 - Dec 31 of same year)
  if (
    isSameDay(from, startOfYear(from)) &&
    isSameDay(to, endOfYear(to)) &&
    fromYear === toYear
  ) {
    return `Jan - Dec ${fromYear}`;
  }

  // Check if it's a half year (H1: Jan-Jun, H2: Jul-Dec)
  if (fromYear === toYear) {
    const fromMonth = getMonth(from);
    const toMonth = getMonth(to);

    // H1: Jan 1 - Jun 30
    if (
      fromMonth === 0 &&
      toMonth === 5 &&
      isSameDay(from, startOfMonth(from)) &&
      isSameDay(to, endOfMonth(to))
    ) {
      return `H1 ${fromYear}`;
    }

    // H2: Jul 1 - Dec 31
    if (
      fromMonth === 6 &&
      toMonth === 11 &&
      isSameDay(from, startOfMonth(from)) &&
      isSameDay(to, endOfMonth(to))
    ) {
      return `H2 ${fromYear}`;
    }
  }

  // Check if it's a full quarter
  if (
    isSameDay(from, startOfQuarter(from)) &&
    isSameDay(to, endOfQuarter(to)) &&
    getQuarter(from) === getQuarter(to) &&
    fromYear === toYear
  ) {
    const quarter = getQuarter(from);
    return `Q${quarter} ${fromYear}`;
  }

  // Check if it's a full month
  if (
    isSameDay(from, startOfMonth(from)) &&
    isSameDay(to, endOfMonth(to)) &&
    getMonth(from) === getMonth(to) &&
    fromYear === toYear
  ) {
    return format(from, "MMMM yyyy");
  }

  // Check if it's a multi-month span (starts at beginning of month, ends at end of month)
  if (
    isSameDay(from, startOfMonth(from)) &&
    isSameDay(to, endOfMonth(to))
  ) {
    const fromMonthName = format(from, "MMM");
    const toMonthName = format(to, "MMM");

    if (fromYear === toYear) {
      return `${fromMonthName} - ${toMonthName} ${fromYear}`;
    } else {
      return `${fromMonthName} ${fromYear} - ${toMonthName} ${toYear}`;
    }
  }

  // Default: show full date range
  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
}

// Format date range with full explicit dates (e.g., "Jul 1 - Jul 31, 2025")
export function formatDateRangeFull(range: DateRange | undefined): string {
  if (!range) return "";

  const { from, to } = range;
  const fromYear = getYear(from);
  const toYear = getYear(to);

  if (fromYear === toYear) {
    // Same year: "Jul 1 - Jul 31, 2025"
    return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
  } else {
    // Different years: "Dec 1, 2024 - Jan 31, 2025"
    return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
  }
}

// Get month names
export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const;

export const MONTH_FULL_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

// Get quarter label
export function getQuarterLabel(quarter: number): string {
  return `Q${quarter}`;
}

// Get months in quarter
export function getQuarterMonths(quarter: number): string {
  const monthRanges = [
    "Jan - Mar",
    "Apr - Jun",
    "Jul - Sep",
    "Oct - Dec"
  ];
  return monthRanges[quarter - 1];
}

// Generate year options
export function getYearOptions(startYear: number, count: number = 10): number[] {
  return Array.from({ length: count }, (_, i) => startYear - i);
}

// Get current year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Get current quarter (1-4)
export function getCurrentQuarter(): number {
  const month = new Date().getMonth();
  return Math.floor(month / 3) + 1;
}

// Create range spanning multiple months
export function getMonthSpanRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): DateRange {
  const startNum = startYear * 12 + startMonth;
  const endNum = endYear * 12 + endMonth;
  const [fromYear, fromMonth, toYear, toMonth] =
    startNum <= endNum
      ? [startYear, startMonth, endYear, endMonth]
      : [endYear, endMonth, startYear, startMonth];

  const fromDate = setMonth(setYear(new Date(), fromYear), fromMonth);
  const toDate = setMonth(setYear(new Date(), toYear), toMonth);
  return {
    from: startOfMonth(fromDate),
    to: endOfMonth(toDate),
  };
}

// Create range spanning multiple quarters
export function getQuarterSpanRange(
  startYear: number,
  startQuarter: number,
  endYear: number,
  endQuarter: number
): DateRange {
  const startNum = startYear * 4 + startQuarter;
  const endNum = endYear * 4 + endQuarter;
  const [fromYear, fromQuarter, toYear, toQuarter] =
    startNum <= endNum
      ? [startYear, startQuarter, endYear, endQuarter]
      : [endYear, endQuarter, startYear, startQuarter];

  const fromRange = getQuarterRange(fromYear, fromQuarter);
  const toRange = getQuarterRange(toYear, toQuarter);
  return { from: fromRange.from, to: toRange.to };
}

// Create range spanning multiple half-years
export function getHalfYearSpanRange(
  startYear: number,
  startHalf: 1 | 2,
  endYear: number,
  endHalf: 1 | 2
): DateRange {
  const startNum = startYear * 2 + startHalf;
  const endNum = endYear * 2 + endHalf;
  const [fromYear, fromHalf, toYear, toHalf] =
    startNum <= endNum
      ? [startYear, startHalf, endYear, endHalf]
      : [endYear, endHalf, startYear, startHalf];

  const fromRange = getHalfYearRange(fromYear, fromHalf as 1 | 2);
  const toRange = getHalfYearRange(toYear, toHalf as 1 | 2);
  return { from: fromRange.from, to: toRange.to };
}

// Create range spanning multiple years
export function getYearSpanRange(startYear: number, endYear: number): DateRange {
  const [fromYear, toYear] =
    startYear <= endYear ? [startYear, endYear] : [endYear, startYear];

  const fromRange = getYearRange(fromYear);
  const toRange = getYearRange(toYear);
  return { from: fromRange.from, to: toRange.to };
}

// Detect the type of date range for tab selection
export type RangeType = "days" | "month" | "quarter" | "half" | "year";

export function detectRangeType(range: DateRange | undefined): RangeType {
  if (!range) return "days";

  const { from, to } = range;
  const fromYear = getYear(from);
  const toYear = getYear(to);

  // Check if it's a full year
  if (
    isSameDay(from, startOfYear(from)) &&
    isSameDay(to, endOfYear(to)) &&
    fromYear === toYear
  ) {
    return "year";
  }

  // Check if it's a half year
  if (fromYear === toYear) {
    const fromMonth = getMonth(from);
    const toMonth = getMonth(to);

    if (
      ((fromMonth === 0 && toMonth === 5) || (fromMonth === 6 && toMonth === 11)) &&
      isSameDay(from, startOfMonth(from)) &&
      isSameDay(to, endOfMonth(to))
    ) {
      return "half";
    }
  }

  // Check if it's a full quarter
  if (
    isSameDay(from, startOfQuarter(from)) &&
    isSameDay(to, endOfQuarter(to)) &&
    getQuarter(from) === getQuarter(to) &&
    fromYear === toYear
  ) {
    return "quarter";
  }

  // Check if it's a full month
  if (
    isSameDay(from, startOfMonth(from)) &&
    isSameDay(to, endOfMonth(to)) &&
    getMonth(from) === getMonth(to) &&
    fromYear === toYear
  ) {
    return "month";
  }

  return "days";
}
