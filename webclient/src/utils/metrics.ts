import { CountMetric, MetricType, UniqueValuesMetric } from "../types/metrics";

export function deserializeMetricGraphQL(
  metricType: MetricType,
  serializedMetricDefinition: string
) {
  if (metricType === MetricType.Count) {
    return JSON.parse(serializedMetricDefinition) as CountMetric;
  }
  if (metricType === MetricType.UniqueValues) {
    return JSON.parse(serializedMetricDefinition) as UniqueValuesMetric;
  }
  throw new Error(`Unknown metric type ${metricType}`);
}
