import { Event, GenericRule, User } from "shared-utils";
import { Brand } from "ts-brand"; // https://github.com/kourge/ts-brand

// all possible arguments to a transform function
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

export type NumericComparisonOperator = "=" | "!=" | ">" | "<" | ">=" | "<=";

// branded types prevent this from being used as a string array and vice versa
export type JsonField = Brand<string[], "JsonField">;
export type Signature = Brand<string, "Signature">;

// data that the transform function can act on
export enum TransformFunctionContextType {
  EVENT,
  EVENT_ARRAY,
  USER,
  RULE,
}

interface BaseTransformFunctionInterface {
  functionID: string;
  functionName: string;
  arguments: TransformFunctionArgumentType[];
  context: TransformFunctionContextType[];
  returnType: TransformFunctionArgumentType;
  getFunctionID(): string;
  getFunctionName(): string;
  getArguments(): TransformFunctionArgumentType[];
  getReturnType(): TransformFunctionArgumentType;
}

export interface TransformFunctionInterface
  extends BaseTransformFunctionInterface {}

export class BaseTransformFunction implements BaseTransformFunctionInterface {
  // these are placeholder arguments
  functionID = "baseTransformFunction";
  functionName = "Base Transform Function";
  arguments: TransformFunctionArgumentType[] = [];
  returnType: TransformFunctionArgumentType =
    TransformFunctionArgumentType.BOOLEAN;
  context: TransformFunctionContextType[] = [];

  getArguments(): TransformFunctionArgumentType[] {
    return this.arguments;
  }
  getContextType(): TransformFunctionContextType[] {
    return this.context;
  }
  getFunctionID() {
    return this.functionID;
  }
  getFunctionName() {
    return this.functionName;
  }
  getReturnType(): TransformFunctionArgumentType {
    return this.returnType;
  }
  executeFunction(
    args: any[],
    metadata: {
      event?: Event;
      user?: User;
      rule?: GenericRule;
      functionInstanceID: string;
      userSignature?: Signature;
    }
  ): Promise<any> {
    return Promise.resolve({
      args,
      metadata,
    });
  }
}

export function areArgumentsValid({
  inputArguments,
  expectedArguments,
}: {
  inputArguments: TransformFunctionArgumentType[];
  expectedArguments: TransformFunctionArgumentType[];
}): boolean {
  if (inputArguments.length !== expectedArguments.length) {
    return false;
  }
  for (let i = 0; i < inputArguments.length; i++) {
    if (inputArguments[i] !== expectedArguments[i]) {
      return false;
    }
  }
  return true;
}
