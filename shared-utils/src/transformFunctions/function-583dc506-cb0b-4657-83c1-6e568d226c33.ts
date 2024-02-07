import {
  BaseTransformFunction,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

/*

example datastore:
{ 
  transformFunction: {
    functionID: "583dc506-cb0b-4657-83c1-6e568d226c33",
    arguments: [true]
  }
}
*/

// this function returns the argument it receives
export class Function583dc506cb0b465783c16e568d226c33
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "583dc506-cb0b-4657-83c1-6e568d226c33";
  functionName = "Boolean identity function";
  arguments: TransformFunctionArgumentType[] = [
    TransformFunctionArgumentType.BOOLEAN,
  ];
  returnType: TransformFunctionArgumentType =
    TransformFunctionArgumentType.BOOLEAN;

  executeFunction(args: [boolean]): Promise<boolean> {
    const [x] = args;
    return Promise.resolve(x);
  }
}
