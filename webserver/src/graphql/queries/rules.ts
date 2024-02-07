import { gql } from "apollo-server-core";
import prisma, { RuleStatus } from "shared-utils";
import { Resolvers, SingleMetricThresholdInput } from "../../generated/types";
import { PRISMA_TO_GQL_METRIC_TYPE_MAP } from "../../utils/types";

const typeDefs = gql`
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type RuleAction {
    ruleActionID: String!
    name: String!
  }
  type RuleActionPreview {
    ruleActionID: String!
    name: String!
  }
  type SingleMetricThreshold {
    metricID: String!
    operator: String!
    value: Float!
    metricName: String!
  }
  type Rule {
    ruleID: String!
    name: String!
    thresholds: [SingleMetricThreshold!]!
    ruleActions: [RuleActionPreview!]!
  }
  extend type Query {
    getRuleActions: [RuleAction!]!
    getRules: [Rule!]!
  }
`;

const resolvers: Resolvers = {
  Query: {
    getRuleActions: async function (_, __, { customerID }) {
      const ruleActions = await prisma.ruleAction.findMany({
        where: {
          customerID: customerID,
        },
      });
      return ruleActions.map((ruleAction) => ({
        ruleActionID: ruleAction.ruleActionID,
        name: ruleAction.name,
      }));
    },
    getRules: async function (_, __, { customerID }) {
      const rules = await prisma.rule.findMany({
        where: {
          customerID: customerID,
          status: {
            not: RuleStatus.HIDDEN
          }
        },
        include: {
          RuleActionRuleLinkage: {
            include: {
              ruleAction: true,
            },
          },
        },
      });
      const allMetricIDs = rules
        .map((rule) =>
          rule.ruleDefinition
            ? (rule.ruleDefinition as SingleMetricThresholdInput[]).map(
                (ruleDefinition) => ruleDefinition.metricID
              )
            : []
        )
        .flat();
      const metricNames = await prisma.metric.findMany({
        where: {
          metricID: {
            in: allMetricIDs,
          },
        },
      });
      const metricIDToNameMap = new Map<string, string>();
      metricNames.forEach((metric) => {
        metricIDToNameMap.set(metric.metricID, metric.metricName);
      });

      return rules.map((rule) => ({
        ruleID: rule.ruleID,
        name: rule.name,
        thresholds: rule.ruleDefinition
          ? (rule.ruleDefinition as SingleMetricThresholdInput[]).map(
              (ruleDefinition) => ({
                metricID: ruleDefinition.metricID,
                operator: ruleDefinition.operator,
                value: ruleDefinition.value,
                metricName: metricIDToNameMap.get(
                  ruleDefinition.metricID
                ) as string,
              })
            )
          : [],
        ruleActions: rule.RuleActionRuleLinkage.map((ruleAction) => ({
          ruleActionID: ruleAction.ruleActionID,
          name: ruleAction.ruleAction.name,
        })),
      }));
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
