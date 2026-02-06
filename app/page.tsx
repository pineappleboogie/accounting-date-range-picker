"use client";

import * as React from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "@/components/date-range-picker/utils";
import {
  DemoControlPanel,
  ControlPanelConfig,
  defaultConfig,
} from "@/components/demo-control-panel";

export default function Home() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [config, setConfig] = React.useState<ControlPanelConfig>(defaultConfig);

  const handleConfigChange = (newConfig: ControlPanelConfig) => {
    // When switching to single date mode, convert range to single date (use from date)
    if (newConfig.singleDateMode && !config.singleDateMode && dateRange) {
      setDateRange({ from: dateRange.from, to: dateRange.from });
    }
    // When switching from single date mode to range mode, keep the date - it remains as from === to
    // which displays as a single date, and user can select a new range in the picker
    setConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-start justify-center pt-[35vh]">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder={config.singleDateMode ? "Select date" : "Select date range"}
          hideSidebar={config.hideSidebar}
          hideCustomPresets={config.hideCustomPresets}
          singleDateMode={config.singleDateMode}
        />
      </div>

      <DemoControlPanel
        config={config}
        onChange={handleConfigChange}
        className="sticky top-0 h-screen overflow-y-auto"
      />
    </div>
  );
}
