import { DocumentNode } from "graphql";
import { gql } from "apollo-server-core";
import prisma, {
  validateMetric,
} from "shared-utils";
import { GQL_TO_PRISMA_METRIC_TYPE_MAP } from "../../utils/types";
import { MetricType as gql_MetricType, Resolvers } from "../../generated/types";

const typeDefs: DocumentNode = gql`
  enum MetricType {
    COUNT
    UNIQUE_VALUES
  }
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  input MetricInput {
    metricName: String!
    metricType: MetricType!
    stringifiedMetricDefinition: String! # stringified JSON, deserialized based on type
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  extend type Mutation {
    createMetric(metric: MetricInput!): Void
    deleteMetric(metricID: String!): Void
  }
`;

const resolvers: Resolvers = {
  Mutation: {
    createMetric: async (_, { metric }, { customerID }) => {
      const createdMetric: any = JSON.parse(metric.stringifiedMetricDefinition);
      const validatedMetric = validateMetric(createdMetric, metric.metricType);
      await prisma.metric.create({
        data: {
          metricName: metric.metricName,
          metricType: GQL_TO_PRISMA_METRIC_TYPE_MAP[metric.metricType],
          metricDefinition: validatedMetric,
          customerID: customerID,
        },
      });
      return null;
    },
    deleteMetric: async (_, { metricID }, { customerID }) => {
      await prisma.metric.delete({
        where: {
          metricID: metricID,
          customerID: customerID,
        },
      });
      return null;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
