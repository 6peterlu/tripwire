import {
  TransformFunctionArgumentPrimitives,
  TransformFunctionRepresentation,
} from "../CreateGenericRuleModal";

export function accessObjectOnIndexPath(
  functionRepresentation: TransformFunctionRepresentation,
  indices: number[]
):
  | TransformFunctionRepresentation
  | TransformFunctionArgumentPrimitives
  | null {
  let currentObject:
    | TransformFunctionRepresentation
    | TransformFunctionArgumentPrimitives
    | null = functionRepresentation;

  for (let i = 0; i < indices.length; i++) {
    if (
      currentObject === null ||
      (currentObject as TransformFunctionRepresentation).arguments ===
        undefined ||
      (currentObject as TransformFunctionRepresentation).arguments === null
    ) {
      throw new Error("invalid argument indices, too many");
    }
    currentObject = (currentObject as TransformFunctionRepresentation)
      .arguments![indices[i]];
  }
  return currentObject;
}

export function updateObjectOnIndexPath(
  functionRepresentation: TransformFunctionRepresentation,
  indices: number[],
  newArgValue:
    | TransformFunctionRepresentation
    | TransformFunctionArgumentPrimitives
) {
  let currentObject:
    | TransformFunctionRepresentation
    | TransformFunctionArgumentPrimitives
    | null = functionRepresentation;
  console.log("updating indices", indices);

  for (let i = 0; i < indices.length - 1; i++) {
    if (
      currentObject === null ||
      (currentObject as TransformFunctionRepresentation).arguments ===
        undefined ||
      (currentObject as TransformFunctionRepresentation).arguments === null
    ) {
      throw new Error("invalid argument indices, too many");
    }
    currentObject = (currentObject as TransformFunctionRepresentation)
      .arguments![i];
  }
  const lastIndex = indices[indices.length - 1];
  if (
    currentObject === null ||
    (currentObject as TransformFunctionRepresentation).arguments === null
  ) {
    throw new Error("invalid argument indices, too many");
  }

  if (
    JSON.stringify(
      (currentObject as TransformFunctionRepresentation).arguments![lastIndex]
    ) === JSON.stringify(newArgValue)
  ) {
    return false;
  }
  // must modify object rather than replacing it because objects are passed by copy-reference in JS
  // https://stackoverflow.com/questions/16880418/javascript-pass-object-as-reference
  (currentObject as TransformFunctionRepresentation).arguments![lastIndex] =
    newArgValue;
  return true;
}
