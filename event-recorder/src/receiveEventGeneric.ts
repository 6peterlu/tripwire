import prisma, {
  computeRule,
  Event,
  TransformFunctionDatabaseRepresentation,
} from "shared-utils";

export async function processRulesForEvent({
  event,
  customerID,
}: {
  event: Event;
  customerID: string;
}) {
  const allGenericRules = await prisma.genericRule.findMany({
    where: {
      customerID: customerID,
    },
    include: {
      GenericRuleActionLinkage: {
        include: {
          genericRuleAction: true,
        },
      },
    },
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      userID: event.userID,
    },
  });
  const matchedRuleActions: { [ruleID: string]: string[] } = {};
  for (const rule of allGenericRules) {
    const typedRule =
      rule.ruleDefinition as TransformFunctionDatabaseRepresentation;
    const typedSignatureDefinition =
      rule.signatureDefinition as TransformFunctionDatabaseRepresentation;
    const ruleResult = await computeRule({
      transformFunctionRepresentation: typedRule,
      signatureDefinition: typedSignatureDefinition,
      eventContext: event,
      userContext: user,
      ruleContext: rule,
    });
    if (ruleResult) {
      matchedRuleActions[rule.ruleID] = rule.GenericRuleActionLinkage.map(
        (linkage) => linkage.genericRuleAction.ruleActionID
      );
    }
  }
  await prisma.genericRuleActionEvent.createMany({
    data: Object.entries(matchedRuleActions).flatMap(
      ([ruleID, ruleActionIDs]) => {
        return ruleActionIDs.map((action) => ({
          ruleActionID: action,
          ruleID: ruleID,
          timestamp: event.timestamp,
        }));
      }
    ),
  });
}
