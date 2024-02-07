import {
  BaseTransformFunction,
  NumericComparisonOperator,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

export class Function384e4f1176294b569b310596e192f4b2
  extends BaseTransformFunction
  implements TransformFunctionInterface
{
  functionID = "384e4f11-7629-4b56-9b31-0596e192f4b2";
  functionName = "Numeric comparison";
  arguments: TransformFunctionArgumentType[] = [
    TransformFunctionArgumentType.NUMBER,
    TransformFunctionArgumentType.NUMERIC_COMPARISON_OPERATOR,
    TransformFunctionArgumentType.NUMBER,
  ];
  returnType: TransformFunctionArgumentType =
    TransformFunctionArgumentType.BOOLEAN;

  executeFunction(
    args:[number, NumericComparisonOperator, number]
  ): Promise<boolean> {
    const [left, operator, right] = args;
    switch (operator) {
      case "=":
        return Promise.resolve(left === right);
      case "!=":
        return Promise.resolve(left !== right);
      case ">":
        return Promise.resolve(left > right);
      case "<":
        return Promise.resolve(left < right);
      case ">=":
        return Promise.resolve(left >= right);
      case "<=":
        return Promise.resolve(left <= right);
    }
  }
}
