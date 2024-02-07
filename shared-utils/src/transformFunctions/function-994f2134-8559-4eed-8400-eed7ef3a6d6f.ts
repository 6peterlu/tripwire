import {
  BaseTransformFunction,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

// this function returns the argument it receives
export class Function994f213485594eed8400eed7ef3a6d6f
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "994f2134-8559-4eed-8400-eed7ef3a6d6f";
  functionName = "String identity function";
  arguments: TransformFunctionArgumentType[] = [
    TransformFunctionArgumentType.STRING,
  ];
  returnType: TransformFunctionArgumentType =
    TransformFunctionArgumentType.STRING;

  executeFunction(args: [string]): Promise<string> {
    const [x] = args;
    return Promise.resolve(x);
  }
}
