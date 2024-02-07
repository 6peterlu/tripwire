import { gql } from "apollo-server-core";
import { DocumentNode } from "graphql";
import { Resolvers } from "../../generated/types";
import prisma, { validateRule } from "shared-utils";

const typeDefs: DocumentNode = gql`
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  input SingleMetricThresholdInput {
    metricID: String!
    operator: String!
    value: Float!
  }

  input RuleInput {
    name: String!
    thresholds: [SingleMetricThresholdInput!]!
    ruleActions: [String!]!
  }

  extend type Mutation {
    createRule(rule: RuleInput!): Void
  }
`;

const resolvers: Resolvers = {
  Mutation: {
    createRule: async (_, { rule }, { customerID }) => {
      const ruleDefinition = await validateRule(rule, customerID);
      await prisma.rule.create({
        data: {
          name: rule.name,
          ruleDefinition: ruleDefinition.thresholds,
          RuleActionRuleLinkage: {
            createMany: {
              data: ruleDefinition.ruleActions.map((ruleActionID) => ({
                ruleActionID: ruleActionID,
              })),
            },
          },
          customerID: customerID,
        },
      });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
