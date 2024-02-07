import { Event, User } from "shared-utils";
import {
  BaseTransformFunction,
  JsonField,
  TransformFunctionArgumentType,
  TransformFunctionContextType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

// String user attribute field extractor
export class Function13293f8da4574a2496cc249e397698e1
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "13293f8d-a457-4a24-96cc-249e397698e1";
  functionName = "String user attribute field extractor";
  arguments = [TransformFunctionArgumentType.JSON_FIELD];
  returnType = TransformFunctionArgumentType.STRING;
  context: TransformFunctionContextType[] = [
    TransformFunctionContextType.USER,
  ];

  executeFunction(
    args: [JsonField],
    metadata: { user?: User }
  ): Promise<string> {
    const [x] = args;
    const { user } = metadata;
    if (user === undefined) {
      throw new Error("User is undefined");
    }
    let value: any = user.attributeMap;
    for (const key of x) {
      value = value[key];
    }
    if (typeof value !== "string") {
      throw new Error(
        `User field ${x.join(".")} is not a string, it is a ${typeof value}`
      );
    }
    return Promise.resolve(value);
  }
}
