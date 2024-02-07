import {
  BaseTransformFunction,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

export class Function3ffa69b130dd4b7b9262733b5b66327a
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "3ffa69b1-30dd-4b7b-9262-733b5b66327a";
  functionName = "String equals function";
  arguments = [
    TransformFunctionArgumentType.STRING,
    TransformFunctionArgumentType.STRING,
  ];
  returnType = TransformFunctionArgumentType.BOOLEAN;

  executeFunction(args: [string, string]): Promise<boolean> {
    const [a, b] = args;
    return Promise.resolve(a === b);
  }
}
