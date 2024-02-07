import { MetricType } from "../generated/types";
import { MetricType as pr_MetricType } from "shared-utils";

export const GQL_TO_PRISMA_METRIC_TYPE_MAP: Record<MetricType, pr_MetricType> =
  {
    [MetricType.Count]: pr_MetricType.COUNT,
    [MetricType.UniqueValues]: pr_MetricType.UNIQUE_VALUES,
  };

export const PRISMA_TO_GQL_METRIC_TYPE_MAP: Record<pr_MetricType, MetricType> =
  {
    [pr_MetricType.COUNT]: MetricType.Count,
    [pr_MetricType.UNIQUE_VALUES]: MetricType.UniqueValues,
  };
