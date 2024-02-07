import { Select, SelectItem } from "@nextui-org/react";
import {
  TransformFunctionArgumentPrimitives,
  TransformFunctionRepresentation,
} from "../CreateGenericRuleModal";
import { gql, useQuery } from "@apollo/client";
import { GenericRuleArgumentEnum } from "../../../generated/types";
import TransformFunction384e4f1176294b569b310596e192f4b2 from "./TransformFunction384e4f11-7629-4b56-9b31-0596e192f4b2";
import { accessObjectOnIndexPath } from "./utils";
import TransformFunction28d1541e0a574946bcde6bd5b6ea645f from "./TransformFunction28d1541e-0a57-4946-bcde-6bd5b6ea645f";

const QUERY_GET_RULE_ACTIONS = gql`
  query GetRuleOptions($input: GetRuleOptionsInput!) {
    getRuleOptions(input: $input) {
      functionID
      arguments
      returns
      name
    }
  }
`;

export function TransformFunctionDropdown({
  allowedType,
  updateRuleDefinition,
  argumentIndices,
}: {
  allowedType: GenericRuleArgumentEnum;
  updateRuleDefinition: (
    argumentIndices: number[],
    newArgValue:
      | TransformFunctionRepresentation
      | TransformFunctionArgumentPrimitives
  ) => void;
  argumentIndices: number[];
}) {
  console.log("argument indices", argumentIndices);
  const { data, loading, error } = useQuery(QUERY_GET_RULE_ACTIONS, {
    variables: { input: { outputType: allowedType } },
  });
  return (
    <Select
      label="Select a rule"
      className="max-w-xs"
      // using this instead of onSelectionChange because
      // that one gives a set of keys which is more difficult to use
      // in our single select case
      onChange={(e) => {
        // fill in
        updateRuleDefinition(argumentIndices, {
          functionID: e.target.value,
          arguments: null, // initialized to null array inside transform function component
        });
      }}
      defaultSelectedKeys={[]}
    >
      {data?.getRuleOptions.map((option: any) => (
        <SelectItem key={option.functionID}>{option.name}</SelectItem>
      ))}
    </Select>
  );
}

export default function TransformFunctionComponent({
  ruleDefinition,
  updateRuleDefinition,
  argumentIndices,
}: {
  ruleDefinition: TransformFunctionRepresentation | null;
  updateRuleDefinition: (
    argumentIndices: number[],
    newArgValue:
      | TransformFunctionRepresentation
      | TransformFunctionArgumentPrimitives
  ) => void;
  argumentIndices: number[];
}) {
  if (ruleDefinition === null) {
    return (
      <TransformFunctionDropdown
        allowedType={GenericRuleArgumentEnum.Boolean}
        argumentIndices={argumentIndices}
        updateRuleDefinition={updateRuleDefinition}
      />
    );
  } else {
    console.log("argument indices", argumentIndices);
    if (ruleDefinition.functionID === "384e4f11-7629-4b56-9b31-0596e192f4b2") {
      return (
        <TransformFunction384e4f1176294b569b310596e192f4b2
          argumentIndices={argumentIndices}
          updateRuleDefinition={updateRuleDefinition}
          ruleDefinition={ruleDefinition}
        />
      );
    } else if (
      ruleDefinition.functionID === "28d1541e-0a57-4946-bcde-6bd5b6ea645f"
    ) {
      return (
        <TransformFunction28d1541e0a574946bcde6bd5b6ea645f
          argumentIndices={argumentIndices}
          updateRuleDefinition={updateRuleDefinition}
          ruleDefinition={ruleDefinition}
        />
      );
    }
  }

  return <>hi</>;
}
