import { convertGQLRuleDefinitionToPrismaRuleDefinition } from "../../../src/graphql/mutations/genericRules";

test("converting rule from gql to database format works as expected", () => {
  const ruleDefinition = {
    functionID: "1",
    arguments: [
      {
        functionID: "3",
        arguments: [
          {
            functionID: "5",
            arguments: [],
          },
        ],
      },
    ],
  };
  const expected = {
    functionID: "1",
    functionInstanceID: expect.any(String),
    arguments: [
      {
        functionID: "3",
        functionInstanceID: expect.any(String),
        arguments: [
          {
            functionID: "5",
            functionInstanceID: expect.any(String),
            arguments: [],
          },
        ],
      },
    ],
  };
  const result = convertGQLRuleDefinitionToPrismaRuleDefinition(ruleDefinition);
  expect(result).toEqual(expected);
});
