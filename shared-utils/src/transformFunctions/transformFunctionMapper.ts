import {
  BaseTransformFunction,
  TransformFunctionArgumentType,
  TransformFunctionInterface,
} from "./utils/transformFunctionInterface";

export class TransformFunctionMapper {
  transformFunctionMap: { [key: string]: BaseTransformFunction } = {};

  registerTransformFunction(transformFunction: BaseTransformFunction) {
    this.transformFunctionMap[transformFunction.functionID] = transformFunction;
  }

  getTransformFunction(functionID: string): BaseTransformFunction {
    const transformFunction = this.transformFunctionMap[functionID];
    if (transformFunction === undefined) {
      throw new Error(`Transform function ${functionID} not found`);
    }
    return transformFunction;
  }
  getFunctionsWithReturnType({
    returnType,
  }: {
    returnType: TransformFunctionArgumentType;
  }) {
    const allTransformFunctions = Object.values(this.transformFunctionMap);
    return allTransformFunctions.filter(
      (t) => t.getReturnType() === returnType
    );
  }
}

export const globalTransformFunctionMapper = new TransformFunctionMapper();

// import all transform functions
import { FunctionBe0c785e3b9442ba905bf2f28efc5c7b } from "./function-be0c785e-3b94-42ba-905b-f2f28efc5c7b";
globalTransformFunctionMapper.registerTransformFunction(
  new FunctionBe0c785e3b9442ba905bf2f28efc5c7b()
);
import { FunctionC74b16fa1a284566b7b704affc0131d2 } from "./function-c74b16fa-1a28-4566-b7b7-04affc0131d2";
globalTransformFunctionMapper.registerTransformFunction(
  new FunctionC74b16fa1a284566b7b704affc0131d2()
);
import { Function583dc506cb0b465783c16e568d226c33 } from "./function-583dc506-cb0b-4657-83c1-6e568d226c33";
globalTransformFunctionMapper.registerTransformFunction(
  new Function583dc506cb0b465783c16e568d226c33()
);
import { Function994f213485594eed8400eed7ef3a6d6f } from "./function-994f2134-8559-4eed-8400-eed7ef3a6d6f";
globalTransformFunctionMapper.registerTransformFunction(
  new Function994f213485594eed8400eed7ef3a6d6f()
);
import { Function28d1541e0a574946bcde6bd5b6ea645f } from "./function-28d1541e-0a57-4946-bcde-6bd5b6ea645f";
globalTransformFunctionMapper.registerTransformFunction(
  new Function28d1541e0a574946bcde6bd5b6ea645f()
);

import { Function3ffa69b130dd4b7b9262733b5b66327a } from "./function-3ffa69b1-30dd-4b7b-9262-733b5b66327a";
globalTransformFunctionMapper.registerTransformFunction(
  new Function3ffa69b130dd4b7b9262733b5b66327a()
);

import { Function384e4f1176294b569b310596e192f4b2 } from "./function-384e4f11-7629-4b56-9b31-0596e192f4b2";
globalTransformFunctionMapper.registerTransformFunction(
  new Function384e4f1176294b569b310596e192f4b2()
);

import { FunctionF426bde798b442f693418d1716da6b67 } from "./signatureFunctions/function-f426bde7-98b4-42f6-9341-8d1716da6b67";
globalTransformFunctionMapper.registerTransformFunction(
  new FunctionF426bde798b442f693418d1716da6b67()
);

import { Function13293f8da4574a2496cc249e397698e1 } from "./function-13293f8d-a457-4a24-96cc-249e397698e1";
globalTransformFunctionMapper.registerTransformFunction(
  new Function13293f8da4574a2496cc249e397698e1()
);

import { FunctionC06db7067a074ab282b249ec512a7cb6 } from "./signatureFunctions/function-c06db706-7a07-4ab2-82b2-49ec512a7cb6";
globalTransformFunctionMapper.registerTransformFunction(
  new FunctionC06db7067a074ab282b249ec512a7cb6()
);
