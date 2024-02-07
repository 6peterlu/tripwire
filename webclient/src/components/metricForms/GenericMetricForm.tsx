import { MetricCreationState, MetricType } from "../../types/metrics";
import CountMetricForm from "./CountMetricForm";
import UniqueValuesForm from "./UniqueValuesForm";

export default function GenericMetricForm({
  metricType,
  metricCreationState,
  setMetricCreationState,
}: {
  metricType: MetricType;
  metricCreationState: MetricCreationState;
  setMetricCreationState: (state: MetricCreationState) => void;
}) {
  if (metricType === MetricType.Count) {
    return (
      <CountMetricForm
        metricCreationState={metricCreationState}
        setMetricCreationState={setMetricCreationState}
      />
    );
  }
  if (metricType === MetricType.UniqueValues) {
    
    return (
      <UniqueValuesForm
        metricCreationState={metricCreationState}
        setMetricCreationState={setMetricCreationState}
      />
    );
  }
  return <div>Unknown metric type</div>;
}
