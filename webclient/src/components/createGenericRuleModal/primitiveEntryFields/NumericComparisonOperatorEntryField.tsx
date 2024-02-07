import { Select, SelectItem } from "@nextui-org/react";
import { NumericComparisonOperator } from "../transformFunctions/types";

export default function NumericComparisonOperatorEntryField({
  argumentIndices,
  updateRuleDefinition,
  value,
}: {
  argumentIndices: number[];
  updateRuleDefinition: (
    argumentIndices: number[],
    newArgValue: NumericComparisonOperator
  ) => void;
  value: NumericComparisonOperator;
}) {
  return (
    <Select
      selectedKeys={value}
      onChange={(e) => {
        updateRuleDefinition(
          argumentIndices,
          e.target.value as NumericComparisonOperator
        );
      }}
    >
      <SelectItem key="=" value="=" title="Equals" />
      <SelectItem key="!=" value="!=" title="Not Equals" />
      <SelectItem key=">" value=">" title="Greater Than" />
      <SelectItem key="<" value="<" title="Less Than" />
      <SelectItem key=">=" value=">=" title="Greater Than or Equals" />
      <SelectItem key="<=" value="<=" title="Less Than or Equals" />
    </Select>
  );
}
