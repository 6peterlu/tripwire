import { GenericRuleArgumentEnum } from "../../../generated/types";
import {
  TransformFunctionArgumentPrimitives,
  TransformFunctionRepresentation,
} from "../CreateGenericRuleModal";
import NumberEntryField from "../primitiveEntryFields/NumberEntryField";
import { TransformFunctionDropdown } from "./TransformFunctionComponent";
import { accessObjectOnIndexPath } from "./utils";

export default function TransformFunction28d1541e0a574946bcde6bd5b6ea645f({
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
  if ((objectAtPath as TransformFunctionRepresentation).arguments === null) {
    // set to null array first
    updateRuleDefinition(argumentIndices, {
      functionID: "28d1541e-0a57-4946-bcde-6bd5b6ea645f",
      arguments: [null, null],
    });
    return null;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p>instances of</p>
      <TransformFunctionDropdown
        allowedType={GenericRuleArgumentEnum.Boolean}
        argumentIndices={[...argumentIndices, 0]}
        updateRuleDefinition={updateRuleDefinition}
      />
      <p>in</p>
      <NumberEntryField
        argumentIndices={[...argumentIndices, 1]}
        updateRuleDefinition={updateRuleDefinition}
        ruleDefinition={ruleDefinition}
      />
      <p>seconds</p>
    </div>
  );
}
