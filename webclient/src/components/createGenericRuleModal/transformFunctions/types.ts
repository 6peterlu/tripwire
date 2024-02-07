export type NumericComparisonOperator = "=" | "!=" | ">" | "<" | ">=" | "<=";

export enum TransformFunctionArgumentType {
  STRING = "STRING",
  STRING_ARRAY = "STRING_ARRAY",
  NUMBER = "NUMBER",
  NUMBER_ARRAY = "NUMBER_ARRAY",
  BOOLEAN = "BOOLEAN",
  JSON_FIELD = "JSON_FIELD", // a string array that represents a path in a json object
  BOOLEAN_ARRAY = "BOOLEAN_ARRAY",
  NUMERIC_COMPARISON_OPERATOR = "NUMERIC_COMPARISON_OPERATOR", // a string that represents an operator
  SIGNATURE = "SIGNATURE", // a string that represents a signature
}
