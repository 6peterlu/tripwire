import { Event } from "shared-utils";
import {
  BaseTransformFunction,
  JsonField,
  TransformFunctionArgumentType,
  TransformFunctionContextType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

// event numeric field extractor
export class FunctionBe0c785e3b9442ba905bf2f28efc5c7b
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "be0c785e-3b94-42ba-905b-f2f28efc5c7b";
  functionName = "String event field extractor";
  arguments = [TransformFunctionArgumentType.JSON_FIELD];
  returnType = TransformFunctionArgumentType.STRING;
  context: TransformFunctionContextType[] = [
    TransformFunctionContextType.EVENT,
  ];

  executeFunction(
    args: [JsonField],
    metadata: { event?: Event }
  ): Promise<string> {
    const [x] = args;
    const { event } = metadata;
    if (event === undefined) {
      throw new Error("Event is undefined");
    }
    let value: any = event;
    for (const key of x) {
      value = value[key];
    }
    if (typeof value !== "string") {
      throw new Error(
        `Event field ${x.join(".")} is not a string, it is a ${typeof value}`
      );
    }
    return Promise.resolve(value);
  }
}
