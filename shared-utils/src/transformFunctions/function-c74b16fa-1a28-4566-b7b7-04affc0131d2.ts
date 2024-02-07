import {
  BaseTransformFunction,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

// this function returns the argument it receives
export class FunctionC74b16fa1a284566b7b704affc0131d2
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "c74b16fa-1a28-4566-b7b7-04affc0131d2";
  functionName = "Numeric identity function";
  arguments: TransformFunctionArgumentType[] = [
    TransformFunctionArgumentType.NUMBER,
  ];
  returnType: TransformFunctionArgumentType =
    TransformFunctionArgumentType.NUMBER;

  executeFunction(args: [number]): Promise<number> {
    const [x] = args;
    return Promise.resolve(x);
  }
}
