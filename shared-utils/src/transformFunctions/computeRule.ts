import { v4 } from "uuid";
import {
  Signature,
  TransformFunctionContextType,
} from "./utils/transformFunctionInterface";
import {
  Event,
  GenericRule,
  User,
  TransformFunctionDatabaseRepresentation,
  isTransformFunctionDatabaseRepresentation,
} from "shared-utils";
import { globalTransformFunctionMapper } from "./transformFunctionRegister";

type TransformFunctionExecutionStackItem = {
  executionID: string | null;
  functionID: string;
  functionInstanceID: string;
  arguments: any[];
};

// NOTE: this is now a reserved type, no transform function can use this as an input argument.
type FunctionResultReference = {
  executionID: string;
};

function isFunctionResultReference(x: any): x is FunctionResultReference {
  return typeof x === "object" && x.hasOwnProperty("executionID");
}

function computeStackFromEncodedRepresentation(
  executionID: string | null, // if it is null, then this function is the top level function
  encodedRepresentation: TransformFunctionDatabaseRepresentation,
  functionExecutionStack: TransformFunctionExecutionStackItem[]
) {
  const convertedArguments: (
    | boolean
    | string
    | string[]
    | number
    | number[]
    | FunctionResultReference
  )[] = [];
  for (const argument of encodedRepresentation.arguments) {
    if (isTransformFunctionDatabaseRepresentation(argument)) {
      const executionID = v4();
      computeStackFromEncodedRepresentation(
        executionID,
        argument,
        functionExecutionStack
      );
      convertedArguments.push({
        executionID,
      });
    } else {
      convertedArguments.push(argument);
    }
  }
  functionExecutionStack.push({
    executionID: executionID,
    functionID: encodedRepresentation.functionID,
    arguments: convertedArguments,
    functionInstanceID: encodedRepresentation.functionInstanceID,
  });
}

type ExecutionResultMap = {
  [key: string]: any;
};

async function computeRuleDefinitionFunction({
  stackItem,
  executionResultMap,
  eventContext,
  userContext,
  ruleContext,
  userSignature
}: {
  stackItem: TransformFunctionExecutionStackItem;
  executionResultMap: ExecutionResultMap;
  eventContext: Event;
  userContext: User;
  ruleContext: GenericRule;
  userSignature: Signature;
}) {
  const functionClass = globalTransformFunctionMapper.getTransformFunction(
    stackItem.functionID
  );
  const argumentsToPass = stackItem.arguments.map((x) => {
    if (isFunctionResultReference(x)) {
      return executionResultMap[x.executionID];
    } else {
      return x;
    }
  });
  let metadata: {
    event?: Event;
    user?: User;
    rule?: GenericRule;
    functionInstanceID: string;
    userSignature: Signature;
  } = {
    functionInstanceID: stackItem.functionInstanceID,
    userSignature: userSignature,
  };
  // insert context, order is sensitive
  if (functionClass.context.includes(TransformFunctionContextType.EVENT)) {
    metadata.event = eventContext;
  }
  if (functionClass.context.includes(TransformFunctionContextType.USER)) {
    metadata.user = userContext;
  }
  if (functionClass.context.includes(TransformFunctionContextType.RULE)) {
    metadata.rule = ruleContext;
  }

  // TODO: evaluate if there's a better way to pass these args rather than just appending to the array (i.e. separate objects)
  argumentsToPass.push(stackItem.functionInstanceID);
  return await functionClass.executeFunction(argumentsToPass, metadata);
}


async function computeSignatureDefinitionFunction({
  stackItem,
  executionResultMap,
  eventContext,
  userContext
}: {
  stackItem: TransformFunctionExecutionStackItem;
  executionResultMap: ExecutionResultMap;
  eventContext: Event;
  userContext: User;
}) {
  const functionClass = globalTransformFunctionMapper.getTransformFunction(
    stackItem.functionID
  );
  const argumentsToPass = stackItem.arguments.map((x) => {
    if (isFunctionResultReference(x)) {
      return executionResultMap[x.executionID];
    } else {
      return x;
    }
  });
  let metadata: {
    event?: Event;
    user?: User;
    rule?: GenericRule;
    functionInstanceID: string;
  } = {
    functionInstanceID: stackItem.functionInstanceID
  };
  // insert context, order is sensitive
  if (functionClass.context.includes(TransformFunctionContextType.EVENT)) {
    metadata.event = eventContext;
  }
  if (functionClass.context.includes(TransformFunctionContextType.USER)) {
    metadata.user = userContext;
  }

  // TODO: evaluate if there's a better way to pass these args rather than just appending to the array (i.e. separate objects)
  argumentsToPass.push(stackItem.functionInstanceID);
  return await functionClass.executeFunction(argumentsToPass, metadata);
}


async function computeRuleDefinitionResult({
  transformFunctionRepresentation,
  eventContext,
  userContext,
  ruleContext,
  userSignature
}: {
  transformFunctionRepresentation: TransformFunctionDatabaseRepresentation;
  eventContext: Event;
  userContext: User;
  ruleContext: GenericRule;
  userSignature: Signature;
}) {
  const functionExecutionStack: TransformFunctionExecutionStackItem[] = [];
  computeStackFromEncodedRepresentation(
    null,
    transformFunctionRepresentation,
    functionExecutionStack
  );
  const executionResultMap: ExecutionResultMap = {};
  for (const stackItem of functionExecutionStack) {
    const functionResult = await computeRuleDefinitionFunction({
      stackItem,
      executionResultMap,
      eventContext,
      userContext,
      ruleContext,
      userSignature
    });
    if (stackItem.executionID !== null) {
      executionResultMap[stackItem.executionID] = functionResult;
      continue;
    }
    return functionResult as boolean;
  }
  throw new Error(
    "Function execution stack did was invalid: had a non null executionID at the end of the stack"
  );
}

async function computeUserSignatureResult({
  transformFunctionRepresentation,
  eventContext,
  userContext
}: {
  transformFunctionRepresentation: TransformFunctionDatabaseRepresentation;
  eventContext: Event;
  userContext: User;
}) {
  const functionExecutionStack: TransformFunctionExecutionStackItem[] = [];
  computeStackFromEncodedRepresentation(
    null,
    transformFunctionRepresentation,
    functionExecutionStack
  );
  const executionResultMap: ExecutionResultMap = {};
  for (const stackItem of functionExecutionStack) {
    const functionResult = await computeSignatureDefinitionFunction({
      stackItem,
      executionResultMap,
      eventContext,
      userContext
    });
    if (stackItem.executionID !== null) {
      executionResultMap[stackItem.executionID] = functionResult;
      continue;
    }
    // TODO: add user signature linkage to db
    return functionResult as Signature;
  }
  throw new Error(
    "Function execution stack did was invalid: had a non null executionID at the end of the stack"
  );
}


export async function computeRule({
  transformFunctionRepresentation,
  signatureDefinition,
  eventContext,
  userContext,
  ruleContext,
}: {
  transformFunctionRepresentation: TransformFunctionDatabaseRepresentation;
  signatureDefinition: TransformFunctionDatabaseRepresentation;
  eventContext: Event;
  userContext: User;
  ruleContext: GenericRule;
}): Promise<boolean> {
  const userSignature = await computeUserSignatureResult({
    transformFunctionRepresentation: signatureDefinition,
    eventContext,
    userContext
  });
  return await computeRuleDefinitionResult({
    transformFunctionRepresentation,
    eventContext,
    userContext,
    ruleContext,
    userSignature
  });
}
