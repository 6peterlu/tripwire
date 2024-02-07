import {
  TransformFunctionArgumentPrimitives,
  TransformFunctionRepresentation,
} from "../CreateGenericRuleModal";
import NumberEntryField from "../primitiveEntryFields/NumberEntryField";
import NumericComparisonOperatorEntryField from "../primitiveEntryFields/NumericComparisonOperatorEntryField";
import { NumericComparisonOperator } from "./types";
import { accessObjectOnIndexPath } from "./utils";

export default function TransformFunction384e4f1176294b569b310596e192f4b2({
  argumentIndices,
  updateRuleDefinition,
  ruleDefinition,
}: {
  argumentIndices: number[];
  updateRuleDefinition: (
    argumentIndices: number[],
    newArgValue:
      | TransformFunctionRepresentation
      | TransformFunctionArgumentPrimitives
  ) => void;
  ruleDefinition: TransformFunctionRepresentation;
}) {
  const objectAtPath = accessObjectOnIndexPath(ruleDefinition, argumentIndices);
  const args = (objectAtPath as TransformFunctionRepresentation).arguments;
  if (args === null) {
    // set to null array first
    updateRuleDefinition(argumentIndices, {
      functionID: "384e4f11-7629-4b56-9b31-0596e192f4b2",
      arguments: [null, "=", null],
    });
    return null;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <NumberEntryField
        updateRuleDefinition={updateRuleDefinition}
        argumentIndices={[...argumentIndices, 0]}
        ruleDefinition={ruleDefinition}
      />
      <NumericComparisonOperatorEntryField
        updateRuleDefinition={updateRuleDefinition}
        argumentIndices={[...argumentIndices, 1]}
        value={args[1] as NumericComparisonOperator}
      />
      <NumberEntryField
        updateRuleDefinition={updateRuleDefinition}
        argumentIndices={[...argumentIndices, 2]}
        ruleDefinition={ruleDefinition}
      />
    </div>
  );
}
