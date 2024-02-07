import { Operator } from "./metrics";

export type SingleMetricThreshold = {
  metricID: string;
  operator: Operator;
  value: number;
};

export type RuleState = {
  ruleID?: string;
  name: string;
  thresholds: SingleMetricThreshold[];
  ruleActions: string[]; // rule action IDs
};
