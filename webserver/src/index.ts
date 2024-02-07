import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import mutations from "./graphql/mutations";
import queries from "./graphql/queries";
import scalars from "./graphql/scalars";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { DateTimeResolver } from "graphql-scalars";
import { gql } from "apollo-server-core";
import prisma from "shared-utils";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const baseTypeDef = gql`
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Query
  type Mutation
`;

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  schema: buildSubgraphSchema([
    { typeDefs: baseTypeDef },
    scalars,
    ...queries,
    ...mutations,
  ]),
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
async function run() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      // TODO: use actual auth instead of just reading customer ID from DB
      const existingCustomer = await prisma.customer.findFirstOrThrow();
      return { customerID: existingCustomer.customerID };
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

run();
