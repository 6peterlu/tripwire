// TODO: dedupe with webserver/src/utils/metricTypes.ts
// last attempt was to use a shared-utils package, but it didn't work because of webpack issues
// likely need to eject from create-react-app to get this to work
// currently, webclient can't import anything from shared-utils

import { MetricType } from "@prisma/client";
import z from "zod";

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string
): keyof T | null {
  let longDesc: string = "No Match";

  Object.keys(myEnum).forEach((key) => {
    if (myEnum[key] === enumValue) longDesc = key;
  });

  return longDesc;
}
// zod documentation: https://zod.dev/

export enum Operator {
  EQUALS = "EQUALS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN_OR_EQUALS = "GREATER_THAN_OR_EQUALS",
  LESS_THAN_OR_EQUALS = "LESS_THAN_OR_EQUALS",
}

export enum StringOperator {
  EQUALS = "EQUALS",
}

// operators allowed for numeric values
// TODO: abstract this into function that can accept any enum
export const operatorKeys = Object.keys(Operator).filter((key) =>
  isNaN(Number(key))
);

// operators that are allowed for string values
export const stringOperatorKeys = Object.keys(StringOperator).filter((key) =>
  isNaN(Number(key))
);

export enum TransformerType {
  LENGTH = "LENGTH",
  IDENTITY = "IDENTITY", // no transformation
}

// zod recursive types: https://github.com/colinhacks/zod#recursive-types
// basically, you have to type hint to zod what the type is, and then use z.lazy to tell zod to use that type
// modify the base model to add fields
// extend to add recursive fields
const baseZTransformFunction = z.object({
  function: z.nativeEnum(TransformerType),
});

// z.infer creates a traditional TS type from a zod type
type TransformFunction = z.infer<typeof baseZTransformFunction> & {
  arguments: (TransformFunction | string)[];
};

export const ZTransformFunction: z.ZodType<TransformFunction> =
  baseZTransformFunction.extend({
    arguments: z.lazy(() => z.union([ZTransformFunction, z.string()]).array()),
  });

const baseZCondition = z.object({
  transformFunction: ZTransformFunction,
  operator: z.nativeEnum(Operator),
  value: z.union([z.string(), z.number()]).optional(),
});

export type Condition = z.infer<typeof baseZCondition> & {
  subconditions?: Condition[];
};

export const ZCondition: z.ZodType<Condition> = baseZCondition.extend({
  subconditions: z.lazy(() => z.array(ZCondition)).optional(),
});

export const ZCountMetric = z.object({
  timeWindowSeconds: z.number(),
  eventType: z.string(),
  conditions: z.array(ZCondition),
});

export type CountMetric = z.infer<typeof ZCountMetric>;

export const ZUniqueValuesMetric = z.object({
  timeWindowSeconds: z.number(),
  eventType: z.string(),
  transformFunction: ZTransformFunction,
  conditions: z.array(ZCondition),
});

export type UniqueValuesMetric = z.infer<typeof ZUniqueValuesMetric>;

// TODO: how to support multiple event type processing in metrics
// tabling until a clearer use case is presented
export function validateMetric(metric: any, metricType: MetricType) {
  switch (metricType) {
    case MetricType.COUNT:
      return ZCountMetric.parse(metric);
    case MetricType.UNIQUE_VALUES:
      return ZUniqueValuesMetric.parse(metric);
    default:
      throw new Error("Invalid metric type");
  }
}

export type MetricUnion = CountMetric | UniqueValuesMetric;

export const metricKeys = Object.keys(MetricType).filter((key) =>
  isNaN(Number(key))
);

export type MetricCreationState = {
  metricType: MetricType;
  metricDefinition: MetricUnion;
  metricName: string;
};

export type SelectKey = string | number;
