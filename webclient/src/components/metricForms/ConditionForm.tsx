import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import {
  MetricCreationState,
  Operator,
  SelectKey,
  TransformerType,
  getEnumKeyByEnumValue,
  operatorKeys,
} from "../../types/metrics";
import { OPERATOR_DISPLAY_MAP } from "../../types/shared";

export default function ConditionForm({
  metricCreationState,
  setMetricCreationState,
  index,
}: {
  metricCreationState: MetricCreationState;
  setMetricCreationState: (state: MetricCreationState) => void;
  index: number;
}) {
  function updateOperatorInState(operator: Operator) {
    const newConditions = [...metricCreationState.metricDefinition.conditions];
    newConditions[index].operator = operator;
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        conditions: newConditions,
      },
    });
  }

  function updateFieldInState(field: string) {
    const newConditions = [...metricCreationState.metricDefinition.conditions];
    newConditions[index].transformFunction = {
      function: TransformerType.IDENTITY,
      arguments: [field],
    };
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        conditions: newConditions,
      },
    });
  }

  function updateValueInState(value: string) {
    const newConditions = [...metricCreationState.metricDefinition.conditions];
    newConditions[index].value = value;
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        conditions: newConditions,
      },
    });
  }

  function deleteConditionFromState() {
    const newConditions = [...metricCreationState.metricDefinition.conditions];
    newConditions.splice(index, 1);
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        conditions: newConditions,
      },
    });
  }

  return (
    <div>
      {index === 0 && <p>filtering conditions</p>}
      {index > 0 && <p>and</p>}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Input
          placeholder="Field"
          onChange={(e) => {
            updateFieldInState(e.target.value);
          }}
          value={
            metricCreationState.metricDefinition.conditions[index]
              .transformFunction.arguments[0] as string
          }
        />
        <Select
          aria-labelledby="operator-select"
          className="max-w-xs"
          // using this instead of onSelectionChange because
          // that one gives a set of keys which is more difficult to use
          // in our single select case
          onChange={(e) => {
            updateOperatorInState(
              Operator[e.target.value as keyof typeof Operator]
            );
          }}
          defaultSelectedKeys={
            [
              getEnumKeyByEnumValue(
                Operator,
                metricCreationState.metricDefinition.conditions[index].operator
              ),
            ] as SelectKey[]
          }
        >
          {operatorKeys.map((t) => (
            <SelectItem key={t} value={t}>
              {OPERATOR_DISPLAY_MAP[t]}
            </SelectItem>
          ))}
        </Select>
        <Input
          placeholder="Value"
          onChange={(e) => {
            updateValueInState(e.target.value);
          }}
          value={
            metricCreationState.metricDefinition.conditions[index]
              .value as string
          }
        />
        <Button
          color="danger"
          variant="light"
          style={{ minWidth: 0 }}
          onPress={deleteConditionFromState}
        >
          X
        </Button>
      </div>
    </div>
  );
}
