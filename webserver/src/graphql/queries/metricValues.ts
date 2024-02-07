import { gql } from "apollo-server-core";
import prisma from "shared-utils";
import { Resolvers } from "../../generated/types";

const typeDefs = gql`
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type MetricValue {
    value: Float!
  }

  extend type Query {
    getMetricValueHistogram(metricID: String!): [MetricValue!]!
  }
`;

const resolvers: Resolvers = {
  Query: {
    getMetricValueHistogram: async function (_, { metricID }, { customerID }) {
      const metric = await prisma.metric.findFirst({
        where: {
          metricID: metricID,
          customerID: customerID,
        },
      });
      if (!metric) {
        throw new Error("Metric not found");
      }
      const currentTime = new Date();
      const metricValues = await prisma.userMetricValue.findMany({
        where: {
          metricID: metricID,
          startTime: {
            lte: currentTime,
          },
          endTime: {
            gt: currentTime,
          },
        },
      });
      return metricValues.map((metricValue) => ({
        value: metricValue.value,
      }));
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
