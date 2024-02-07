import {
  BaseTransformFunction,
  Signature,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "../utils/transformFunctionInterface";

import { v5 } from "uuid";

export class FunctionC06db7067a074ab282b249ec512a7cb6
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "c06db706-7a07-4ab2-82b2-49ec512a7cb6";
  functionName = "Signature generation from string";
  arguments: TransformFunctionArgumentType[] = [
    TransformFunctionArgumentType.STRING,
  ];
  context = [];
  returnType = TransformFunctionArgumentType.SIGNATURE;

  executeFunction(
    args: [string],
    metadata: { functionInstanceID: string }
  ): Promise<Signature> {
    const [inputString] = args;
    const signature = v5(inputString, metadata.functionInstanceID) as Signature;
    return Promise.resolve(signature);
  }
}
