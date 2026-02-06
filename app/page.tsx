"use client";

import * as React from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "@/components/date-range-picker/utils";

export default function Home() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        placeholder="Select date range"
      />
    </div>
  );
}
