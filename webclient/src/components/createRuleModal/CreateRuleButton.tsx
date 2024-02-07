import { ApolloQueryResult, gql, useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { RuleState } from "../../types/rules";
import {
  Operator,
  getEnumKeyByEnumValue,
  operatorKeys,
} from "../../types/metrics";
import { OPERATOR_DISPLAY_MAP } from "../../types/shared";

const QUERY_GET_METRICS = gql`
  query GetMetrics {
    getMetrics {
      metricID
      metricType
      metricName
    }
  }
`;

const QUERY_GET_RULE_ACTIONS = gql`
  query GetRuleActions {
    getRuleActions {
      ruleActionID
      name
    }
  }
`;

const MUTATION_CREATE_RULE = gql`
  mutation CreateRule($rule: RuleInput!) {
    createRule(rule: $rule)
  }
`;

export default function CreateRuleButton({
  rulesDataRefetch,
}: {
  rulesDataRefetch: () => Promise<ApolloQueryResult<any>>;
}) {
  const { isOpen, onOpenChange } = useDisclosure();
  const { data: metricGraphqlData } = useQuery(QUERY_GET_METRICS);
  const { data: ruleActionGraphqlData } = useQuery(QUERY_GET_RULE_ACTIONS);
  const [createRule] = useMutation(MUTATION_CREATE_RULE);
  const [ruleState, setRuleState] = useState<RuleState>({
    name: "",
    thresholds: [],
    ruleActions: [],
  });
  useEffect(() => {
    if (
      !metricGraphqlData ||
      metricGraphqlData.getMetrics.length === 0 ||
      ruleState.thresholds.length > 0
    ) {
      return;
    }
    setRuleState({
      ...ruleState,
      thresholds: [
        {
          metricID: metricGraphqlData.getMetrics[0].metricID,
          operator: Operator.GREATER_THAN,
          value: 0,
        },
      ],
    });
  }, [metricGraphqlData, ruleState]);
  function updateMetricIDInThreshold(metricID: string, index: number) {
    const newThresholds = [...ruleState.thresholds];
    newThresholds[index].metricID = metricID;
    setRuleState({ ...ruleState, thresholds: newThresholds });
  }
  function updateOperatorInThreshold(operator: Operator, index: number) {
    const newThresholds = [...ruleState.thresholds];
    newThresholds[index].operator = operator;
    setRuleState({ ...ruleState, thresholds: newThresholds });
  }
  function updateValueInThreshold(value: number, index: number) {
    const newThresholds = [...ruleState.thresholds];
    newThresholds[index].value = value;
    setRuleState({ ...ruleState, thresholds: newThresholds });
  }
  function addCondition() {
    setRuleState({
      ...ruleState,
      thresholds: [
        ...ruleState.thresholds,
        {
          metricID: metricGraphqlData.getMetrics[0].metricID,
          operator: Operator.GREATER_THAN,
          value: 0,
        },
      ],
    });
  }
  function updateRuleActionArray(ruleActionIDs: string[]) {
    setRuleState({
      ...ruleState,
      ruleActions: ruleActionIDs,
    });
  }
  function updateRuleName(ruleName: string) {
    setRuleState({
      ...ruleState,
      name: ruleName,
    });
  }
  const metricDropdownItems: { label: string; value: string }[] =
    useMemo(() => {
      if (!metricGraphqlData) {
        return [];
      }
      return metricGraphqlData.getMetrics.map((metric: any) => ({
        label: metric.metricName,
        value: metric.metricID,
      }));
    }, [metricGraphqlData]);

  const ruleActionDropdownItems: { label: string; value: string }[] =
    useMemo(() => {
      if (!ruleActionGraphqlData) {
        return [];
      }
      return ruleActionGraphqlData.getRuleActions.map((ruleAction: any) => ({
        label: ruleAction.name,
        value: ruleAction.ruleActionID,
      }));
    }, [ruleActionGraphqlData]);

  return (
    <div>
      <Button color="primary" onPress={() => onOpenChange()}>
        Create rule
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create rule</ModalHeader>
              <ModalBody>
                <Input
                  label="rule name"
                  onChange={(e) => {
                    updateRuleName(e.target.value);
                  }}
                  value={ruleState.name}
                />
                {ruleState.thresholds.map((t, index) => (
                  <div key={t.metricID}>
                    {index > 0 && <p>and</p>}
                    <div className="flex">
                      <Select
                        selectedKeys={[t.metricID]}
                        label="metric"
                        onChange={(e) => {
                          updateMetricIDInThreshold(e.target.value, index);
                        }}
                      >
                        {metricDropdownItems.map((metricDropdownItem) => (
                          <SelectItem
                            key={metricDropdownItem.value}
                            value={metricDropdownItem.value}
                          >
                            {metricDropdownItem.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        aria-labelledby="operator-select"
                        selectedKeys={[
                          getEnumKeyByEnumValue(
                            Operator,
                            ruleState.thresholds[index].operator
                          ) as string,
                        ]}
                        onChange={(e) => {
                          updateOperatorInThreshold(
                            Operator[
                              e.target.value as keyof typeof Operator
                            ] as Operator,
                            index
                          );
                        }}
                      >
                        {operatorKeys.map((t) => (
                          <SelectItem key={t} value={t}>
                            {OPERATOR_DISPLAY_MAP[t]}
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        aria-labelledby="value-input"
                        type="number"
                        value={ruleState.thresholds[index].value.toString()}
                        onChange={(e) => {
                          updateValueInThreshold(Number(e.target.value), index);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button onPress={() => addCondition()}>Add condition</Button>
                <div>
                  <p>If user matches rule, take action:</p>
                  <Select
                    label="action"
                    selectionMode="multiple"
                    onSelectionChange={(selection) => {
                      if (selection === "all") {
                        return;
                      }
                      const keys = selection.values();
                      updateRuleActionArray(Array.from(keys) as string[]);
                    }}
                  >
                    {ruleActionDropdownItems.map((ruleActionDropdownItem) => (
                      <SelectItem
                        key={ruleActionDropdownItem.value}
                        value={ruleActionDropdownItem.value}
                      >
                        {ruleActionDropdownItem.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    await createRule({ variables: { rule: ruleState } });
                    await rulesDataRefetch();
                    onClose();
                  }}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
