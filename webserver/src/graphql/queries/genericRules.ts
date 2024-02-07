import { gql } from "apollo-server-core";
import prisma, { globalTransformFunctionMapper } from "shared-utils";
import { GenericRuleArgumentEnum, Resolvers } from "../../generated/types";
import { PRISMA_TO_GQL_METRIC_TYPE_MAP } from "../../utils/types";
import { TransformFunctionArgumentType } from "shared-utils/src/transformFunctions/utils/transformFunctionInterface";

const typeDefs = gql`
  enum GenericRuleArgumentEnum {
    STRING
    STRING_ARRAY
    NUMBER
    NUMBER_ARRAY
    BOOLEAN
    JSON_FIELD
    BOOLEAN_ARRAY
    NUMERIC_COMPARISON_OPERATOR
    SIGNATURE
  }
  #graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type GenericRuleMetadata {
    functionID: String!
    arguments: [GenericRuleArgumentEnum!]!
    returns: GenericRuleArgumentEnum!
    name: String!
  }

  input GetRuleOptionsInput {
    outputType: GenericRuleArgumentEnum!
  }

  extend type Query {
    getRuleOptions(input: GetRuleOptionsInput!): [GenericRuleMetadata!]!
  }
`;

const resolvers: Resolvers = {
  Query: {
    getRuleOptions: async (_, { input }, { customerID }) => {
      const functionsWithReturnType =
        globalTransformFunctionMapper.getFunctionsWithReturnType({
          returnType:
            input.outputType as unknown as TransformFunctionArgumentType,
        });
      return functionsWithReturnType.map((func) => ({
        functionID: func.functionID,
        arguments: func.arguments.map(
          (arg) => arg as unknown as GenericRuleArgumentEnum
        ),
        returns: func.returnType as unknown as GenericRuleArgumentEnum,
        name: func.functionName,
      }));
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
