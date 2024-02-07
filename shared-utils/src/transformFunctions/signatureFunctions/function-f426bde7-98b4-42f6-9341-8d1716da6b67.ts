import { User } from "shared-utils";
import {
  BaseTransformFunction,
  Signature,
  TransformFunctionArgumentType,
  TransformFunctionContextType,
  TransformFunctionInterface,
} from "../utils/transformFunctionInterface";

export class FunctionF426bde798b442f693418d1716da6b67
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "f426bde7-98b4-42f6-9341-8d1716da6b67";
  functionName = "User ID signature generation function";
  context = [TransformFunctionContextType.USER];
  returnType = TransformFunctionArgumentType.SIGNATURE;

  executeFunction(_: any, metadata: { user?: User }): Promise<Signature> {
    if (!metadata.user) {
      throw new Error("Missing context");
    }
    const { user } = metadata;
    return Promise.resolve(user.userID as Signature);
  }
}
