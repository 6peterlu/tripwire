import { useCallback, useMemo, useState } from "react";
import TransformFunctionComponent from "./transformFunctions/TransformFunctionComponent";
import { gql, useQuery } from "@apollo/client";
import { GenericRuleArgumentEnum } from "../../generated/types";
import {
  accessObjectOnIndexPath,
  updateObjectOnIndexPath,
} from "./transformFunctions/utils";

export type TransformFunctionArgumentPrimitives =
  | string
  | string[]
  | boolean
  | number
  | number[]
  | null;

export type TransformFunctionRepresentation = {
  functionID: string;
  arguments:
    | (TransformFunctionRepresentation | TransformFunctionArgumentPrimitives)[]
    | null;
};

type RuleState = {
  ruleDefinition: TransformFunctionRepresentation | null;
  signatureDefinition: TransformFunctionRepresentation;
};

export default function CreateGenericRuleModal() {
  const [ruleState, setRuleState] = useState<RuleState>({
    ruleDefinition: null,
    signatureDefinition: {
      functionID: "f426bde7-98b4-42f6-9341-8d1716da6b67",
      arguments: [],
    },
  });
  console.log("ruleState", ruleState);
  const updateRuleDefinition = useCallback(
    (
      argumentIndices: number[],
      newArgValue:
        | TransformFunctionRepresentation
        | TransformFunctionArgumentPrimitives
    ) => {
      if (newArgValue === null) {
        return;
      }
      if (argumentIndices.length === 0) {
        if (newArgValue !== null) {
          setRuleState({
            ...ruleState,
            ruleDefinition: newArgValue as TransformFunctionRepresentation,
          });
        }
      } else {
        if (ruleState.ruleDefinition === null) {
          throw new Error("invalid argument indices");
        }
        console.log("=====");
        console.log("argumentIndices", argumentIndices);
        let updatedRuleDefinition = ruleState.ruleDefinition;
        console.log("existing", updatedRuleDefinition);
        console.log("newArgValue", newArgValue);
        const updated = updateObjectOnIndexPath(
          updatedRuleDefinition,
          argumentIndices,
          newArgValue
        );
        console.log("updated", updated);
        if (updated) {
          setRuleState({
            ...ruleState,
            ruleDefinition: updatedRuleDefinition,
          });
        }
      }
    },
    [ruleState]
  );

  return (
    <TransformFunctionComponent
      ruleDefinition={ruleState.ruleDefinition}
      updateRuleDefinition={updateRuleDefinition}
      argumentIndices={[]}
    />
  );
}
