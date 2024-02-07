import { gql } from "apollo-server-core";
import { Resolvers } from "../../generated/types";
import { DateTimeResolver, GraphQLJSONObject } from "graphql-scalars";

const simpleScalars = gql`
  #graphql
  scalar Void
  scalar DateTime
  scalar JSONObject
`;

const scalarResolvers: Resolvers = {
  DateTime: DateTimeResolver,
  JSONObject: GraphQLJSONObject,
};

export default {
  typeDefs: simpleScalars,
  resolvers: scalarResolvers,
};
