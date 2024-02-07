import { Input, Select, SelectItem } from "@nextui-org/react";
import {
  TransformFunctionArgumentPrimitives,
  TransformFunctionRepresentation,
} from "../CreateGenericRuleModal";
import { useState } from "react";
import TransformFunctionComponent, {
  TransformFunctionDropdown,
} from "../transformFunctions/TransformFunctionComponent";
import { GenericRuleArgumentEnum } from "../../../generated/types";
import { accessObjectOnIndexPath } from "../transformFunctions/utils";

export default function NumberEntryField({
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
  const [functionDropdownShowing, setFunctionDropdownShowing] = useState(false);
  const objectOnIndexPath = accessObjectOnIndexPath(
    ruleDefinition,
    argumentIndices
  );
  if (objectOnIndexPath && objectOnIndexPath.hasOwnProperty("functionID")) {
    return (
      <TransformFunctionComponent
        ruleDefinition={ruleDefinition}
        updateRuleDefinition={updateRuleDefinition}
        argumentIndices={argumentIndices}
      />
    );
  }
  if (objectOnIndexPath === null) {
    if (functionDropdownShowing) {
      return (
        <TransformFunctionDropdown
          allowedType={GenericRuleArgumentEnum.Number}
          updateRuleDefinition={updateRuleDefinition}
          argumentIndices={argumentIndices}
        />
      );
    } else {
      return (
        <Select
          label="add fn?"
          onChange={(e) => {
            if (e.target.value === "add") {
              setFunctionDropdownShowing(true);
            } else {
              // default to 0
              updateRuleDefinition(argumentIndices, 0);
            }
          }}
          defaultSelectedKeys={[]}
        >
          <SelectItem key="add">Add function</SelectItem>
          <SelectItem key="no">No function</SelectItem>
        </Select>
      );
    }
  }
  return <Input label="Number" value={String(objectOnIndexPath)} />;
}
