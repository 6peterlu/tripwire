import prisma, { Event, GenericRule, User } from "shared-utils";
import {
  BaseTransformFunction,
  TransformFunctionArgumentType,
  TransformFunctionContextType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

export class Function28d1541e0a574946bcde6bd5b6ea645f
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "28d1541e-0a57-4946-bcde-6bd5b6ea645f";
  functionName = "Count event instances in last X seconds for user";
  arguments: TransformFunctionArgumentType[] = [
    TransformFunctionArgumentType.BOOLEAN, // should count
    TransformFunctionArgumentType.NUMBER, // seconds
  ];
  returnType: TransformFunctionArgumentType =
    TransformFunctionArgumentType.NUMBER;
  context: TransformFunctionContextType[] = [
    TransformFunctionContextType.EVENT,
    TransformFunctionContextType.USER,
    TransformFunctionContextType.RULE,
  ];

  async executeFunction(
    args: [boolean, number],
    metadata: {
      event?: Event;
      user?: User;
      rule?: GenericRule;
      functionInstanceID: string;
      userSignature?: string;
    }
  ): Promise<number> {
    const [shouldCount, numSeconds] = args;
    const { event, user, rule, functionInstanceID, userSignature } = metadata;
    if (!event || !user || !rule || !userSignature) {
      throw new Error("Missing context");
    }
    const genericRuleState = await prisma.genericRuleState.findUnique({
      where: {
        ruleID_functionInstanceID_functionInternalID: {
          functionInstanceID: functionInstanceID,
          functionInternalID: userSignature,
          ruleID: rule.ruleID,
        },
      },
    });

    let recentInstances = genericRuleState
      ? (genericRuleState.state as number[])
      : [];
    const now = event.timestamp;

    recentInstances = recentInstances.filter((instance) => {
      return now.getTime() - instance < numSeconds * 1000;
    });

    if (!shouldCount) {
      return recentInstances.length;
    }
    await prisma.genericRuleState.upsert({
      where: {
        ruleID_functionInstanceID_functionInternalID: {
          functionInstanceID: functionInstanceID,
          functionInternalID: userSignature,
          ruleID: rule.ruleID,
        },
      },
      update: {
        state: [...recentInstances, now.getTime()],
      },
      create: {
        functionInstanceID: functionInstanceID,
        functionInternalID: userSignature,
        ruleID: rule.ruleID,
        state: [now.getTime()],
      },
    });
    return recentInstances.length + 1;
  }
}
