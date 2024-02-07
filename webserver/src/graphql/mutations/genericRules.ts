import { gql } from "apollo-server-core";
import { DocumentNode } from "graphql";
import prisma, {
  TransformFunctionDatabaseRepresentation,
  isTransformFunctionDatabaseRepresentation,
  isTransformFunctionGQLRepresentation,
} from "shared-utils";
import {
  GenericRuleActionInput,
  GenericRuleInput,
  Resolvers,
  RuleAction,
} from "../../generated/types";
import { Context } from "../../utils/context";
import { v4 } from "uuid";

const typeDefs: DocumentNode = gql`
  input GenericRuleInput {
    ruleDefinition: JSONObject!
    userSignatureDefinition: JSONObject!
    ruleActions: [String!]! # uuids
  }
  enum RuleActionType {
    UpdateUserAttribute
  }
  input GenericRuleActionInput {
    ruleActionDefinition: JSONObject!
    ruleActionType: RuleActionType!
  }
  extend type Mutation {
    createGenericRule(rule: GenericRuleInput!): Void
    createGenericRuleAction(ruleAction: GenericRuleActionInput!): Void
  }
`;

export function convertGQLRuleDefinitionToPrismaRuleDefinition(
  ruleDefinition: any
): TransformFunctionDatabaseRepresentation {
  if (!isTransformFunctionGQLRepresentation(ruleDefinition)) {
    throw new Error("Rule definition format was invalid.");
  }

  function conversionHelper(argument: any): any {
    if (isTransformFunctionGQLRepresentation(argument)) {
      return {
        functionID: argument.functionID,
        functionInstanceID: v4(),
        arguments: argument.arguments.map(conversionHelper),
      };
    } else {
      return argument;
    }
  }
  // generate function instanceIDs for each function
  const databaseRepresentation: TransformFunctionDatabaseRepresentation =
    conversionHelper(ruleDefinition);
  return databaseRepresentation;
}

const resolvers: Resolvers = {
  Mutation: {
    createGenericRule: async (
      _,
      { rule }: { rule: GenericRuleInput },
      context: Context
    ) => {
      const { ruleDefinition, ruleActions, userSignatureDefinition } = rule;
      const ruleActionsSet = new Set(ruleActions);
      if (ruleActionsSet.size !== ruleActions.length) {
        throw new Error("Duplicate rule actionIDs were provided.");
      }
      const existingRuleActions = await prisma.genericRuleAction.count({
        where: {
          ruleActionID: {
            in: ruleActions,
          },
        },
      });
      if (existingRuleActions !== ruleActions.length) {
        throw new Error("One or more rule actionIDs was invalid.");
      }
      if (!isTransformFunctionDatabaseRepresentation(ruleDefinition)) {
        throw new Error("Rule definition format was invalid.");
      }
      const ruleDefinitionDatabaseRepresentation =
        convertGQLRuleDefinitionToPrismaRuleDefinition(ruleDefinition);

      const userSignatureDefinitionDatabaseRepresentation =
        convertGQLRuleDefinitionToPrismaRuleDefinition(userSignatureDefinition);
      if (
        !isTransformFunctionDatabaseRepresentation(
          userSignatureDefinitionDatabaseRepresentation
        )
      ) {
        throw new Error("User signature defintion format was invalid");
      }
      // TODO: validate rule
      await prisma.genericRule.create({
        data: {
          ruleDefinition: ruleDefinitionDatabaseRepresentation,
          signatureDefinition:
            userSignatureDefinitionDatabaseRepresentation,
          GenericRuleActionLinkage: {
            createMany: {
              data: ruleActions.map((ruleAction) => ({
                ruleActionID: ruleAction,
              })),
            },
          },
          customerID: context.customerID,
        },
      });
    },
    createGenericRuleAction: async (
      _,
      { ruleAction }: { ruleAction: GenericRuleActionInput },
      context: Context
    ) => {
      const { ruleActionDefinition, ruleActionType } = ruleAction;
      // TODO: validate ruleAction based on type
      await prisma.genericRuleAction.create({
        data: {
          ruleActionData: ruleActionDefinition,
          ruleActionType: ruleActionType,
          customerID: context.customerID,
        },
      });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
