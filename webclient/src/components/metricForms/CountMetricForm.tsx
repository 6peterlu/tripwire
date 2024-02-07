import { Input, Slider, Tooltip } from "@nextui-org/react";
import { MetricCreationState } from "../../types/metrics";
import { useState } from "react";

export default function CountMetricForm({
  metricCreationState,
  setMetricCreationState,
}: {
  metricCreationState: MetricCreationState;
  setMetricCreationState: (state: MetricCreationState) => void;
}) {
  const [inputValue, setInputValue] = useState(
    (metricCreationState.metricDefinition.timeWindowSeconds / 60).toString()
  );
  function updateEventTypeInState(eventType: string) {
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        eventType,
      },
    });
  }
  function updateTimeWindowInState(timeWindowMinutes: number) {
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        timeWindowSeconds: timeWindowMinutes * 60,
      },
    });
  }
  return (
    <div>
      <Input
        label="event type"
        placeholder="Event type"
        value={metricCreationState.metricDefinition.eventType}
        onChange={(e) => updateEventTypeInState(e.target.value)}
      />

      <Slider
        label="Time window (minutes)"
        // we extract the default children to render the input
        renderValue={({ children, ...props }) => (
          <output {...props}>
            <Tooltip
              className="text-tiny text-default-500 rounded-md"
              content="Press Enter to confirm"
              placement="left"
            >
              <input
                className="px-1 py-0.5 w-12 text-right text-small text-default-700 font-medium bg-default-100 outline-none transition-colors rounded-small border-medium border-transparent hover:border-primary focus:border-primary"
                type="text"
                aria-label="Temperature value"
                value={inputValue}
                onChange={(e) => {
                  const v = e.target.value;
                  setInputValue(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isNaN(Number(inputValue))) {
                    updateTimeWindowInState(Number(inputValue));
                  }
                }}
              />
            </Tooltip>
          </output>
        )}
        value={metricCreationState.metricDefinition.timeWindowSeconds / 60}
        onChange={(value) => {
          updateTimeWindowInState(value as number);
          setInputValue(value.toString());
        }}
      />
    </div>
  );
}
