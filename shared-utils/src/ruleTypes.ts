import z from "zod";
import { Operator } from "./metricTypes";
import prisma from "./prisma";

const ZSingleMetricThreshold = z.object({
  metricID: z.string(),
  operator: z.nativeEnum(Operator),
  value: z.number(),
});

const ZRuleInput = z.object({
  name: z.string(),
  thresholds: z.array(ZSingleMetricThreshold),
  ruleActions: z.array(z.string()),
});

export async function validateRule(ruleDefinition: any, customerID: string) {
  const ruleInput = ZRuleInput.parse(ruleDefinition);
  const thresholds = ruleInput.thresholds;
  const metricIDs = thresholds.map((threshold) => threshold.metricID);
  const metrics = await prisma.metric.findMany({
    where: {
      metricID: {
        in: metricIDs,
      },
      customerID: customerID,
    },
  });
  if (metrics.length !== metricIDs.length) {
    throw new Error("Invalid metric ID");
  }
  const ruleActionIDs = ruleInput.ruleActions;
  const ruleActions = await prisma.ruleAction.findMany({
    where: {
      ruleActionID: {
        in: ruleActionIDs,
      },
      customerID: customerID,
    },
  });
  if (ruleActions.length !== ruleActionIDs.length) {
    throw new Error("Invalid rule action ID");
  }
  return ruleInput;
}
