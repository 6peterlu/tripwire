import { gql } from "apollo-server-core";
import { Resolvers } from "../../generated/types";
import prisma from "shared-utils";

const typeDefs = gql`
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Book {
    title: String
    author: String
  }

  type Event {
    eventID: String!
    eventType: String!
    stringifiedEventData: String!
    timestamp: DateTime!
    customerUserID: String!
  }

  extend type Query {
    getEvents(customerUserID: String): [Event!]!
  }
`;

const resolvers: Resolvers = {
  Query: {
    getEvents: async (_, args, { customerID }) => {
      const userIDsForCustomer = await prisma.user.findMany({
        where: {
          customerID: customerID,
          customerUserID: args.customerUserID ?? undefined,
        },
        select: {
          userID: true,
          customerUserID: true,
        },
      });
      const userIDSet = userIDsForCustomer.map((user) => user.userID);
      const events = await prisma.event.findMany({
        where: {
          userID: {
            in: userIDSet,
          },
          timestamp: {
            // last day of events
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 100,
      });
      const userIDToCustomerUserIDMap = userIDsForCustomer.reduce(
        (acc, user) => {
          acc[user.userID] = user.customerUserID;
          return acc;
        },
        {} as Record<string, string>
      );
      return events.map((e) => {
        return {
          eventID: e.eventID,
          eventType: e.eventType,
          stringifiedEventData: JSON.stringify(e.eventData),
          timestamp: e.timestamp,
          customerUserID: userIDToCustomerUserIDMap[e.userID],
        };
      });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
