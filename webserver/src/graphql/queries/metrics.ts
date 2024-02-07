import { gql } from "apollo-server-core";
import prisma from "shared-utils";
import { Resolvers } from "../../generated/types";
import { PRISMA_TO_GQL_METRIC_TYPE_MAP } from "../../utils/types";

const typeDefs = gql`
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Metric {
    metricType: MetricType!
    stringifiedMetricDefinition: String! # stringified JSON, deserialized based on type
    metricID: String!
    metricName: String!
  }

  extend type Query {
    getMetrics: [Metric!]!
  }
`;

const resolvers: Resolvers = {
  Query: {
    getMetrics: async function (_, __, { customerID }) {
      const metrics = await prisma.metric.findMany({
        where: {
          customerID: customerID,
        },
      });
      return metrics.map((metric) => ({
        metricType: PRISMA_TO_GQL_METRIC_TYPE_MAP[metric.metricType],
        stringifiedMetricDefinition: JSON.stringify(metric.metricDefinition),
        metricID: metric.metricID,
        metricName: metric.metricName,
      }));
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
