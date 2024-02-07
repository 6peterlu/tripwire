import { ApolloQueryResult, gql, useMutation } from "@apollo/client";
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
import {
  MetricCreationState,
  MetricType,
  Operator,
  TransformerType,
  UniqueValuesMetric,
  getEnumKeyByEnumValue,
} from "../../types/metrics";
import { useState } from "react";
import GenericMetricForm from "../metricForms/GenericMetricForm";
import ConditionForm from "../metricForms/ConditionForm";

type Key = string | number;

const MUTATION_CREATE_METRIC = gql`
  mutation CreateMetric($metric: MetricInput!) {
    createMetric(metric: $metric)
  }
`;

export default function AddMetricButton({
  refetch,
}: {
  refetch: () => Promise<ApolloQueryResult<any>>;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [createMetric, { loading, error }] = useMutation(
    MUTATION_CREATE_METRIC
  );
  const [metricCreationState, setMetricCreationState] =
    useState<MetricCreationState>({
      metricType: MetricType.Count,
      metricDefinition: {
        eventType: "",
        timeWindowSeconds: 0,
        conditions: [],
      },
      metricName: "",
    });

  function updateMetricTypeInState(metricType: MetricType) {
    const newMetricCreationState = { ...metricCreationState, metricType };
    if (
      metricType === MetricType.Count &&
      (newMetricCreationState.metricDefinition as UniqueValuesMetric)
        .transformFunction
    ) {
      // @ts-ignore
      newMetricCreationState.metricDefinition.transformFunction = undefined;
    } else if (
      metricType === MetricType.UniqueValues &&
      !(newMetricCreationState.metricDefinition as UniqueValuesMetric)
        .transformFunction
    ) {
      // @ts-ignore
      newMetricCreationState.metricDefinition.transformFunction = {
        function: TransformerType.IDENTITY,
        arguments: ["placeholder"],
      };
    }

    setMetricCreationState({
      ...metricCreationState,
      metricType,
    });
  }
  function addStubConditionToState() {
    setMetricCreationState({
      ...metricCreationState,
      metricDefinition: {
        ...metricCreationState.metricDefinition,
        conditions: [
          ...metricCreationState.metricDefinition.conditions,
          {
            transformFunction: {
              function: TransformerType.IDENTITY,
              arguments: ["placeholder"],
            },
            operator: Operator.EQUALS,
            value: "placeholder",
          },
        ],
      },
    });
  }
  function updateMetricNameInState(metricName: string) {
    setMetricCreationState({
      ...metricCreationState,
      metricName,
    });
  }


  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Add metric
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create new metric
              </ModalHeader>
              <ModalBody>
                <Input
                  label="name of metric"
                  onChange={(e) => {
                    updateMetricNameInState(e.target.value);
                  }}
                  value={metricCreationState.metricName}
                />
                <Select
                  label="Select a metric type"
                  className="max-w-xs"
                  // using this instead of onSelectionChange because
                  // that one gives a set of keys which is more difficult to use
                  // in our single select case
                  onChange={(e) => {
                    updateMetricTypeInState(
                      MetricType[e.target.value as keyof typeof MetricType]
                    );
                  }}
                  defaultSelectedKeys={
                    [
                      getEnumKeyByEnumValue(
                        MetricType,
                        metricCreationState.metricType
                      ),
                    ] as Key[]
                  }
                >
                  {Object.keys(MetricType)
                    .filter((key) => isNaN(Number(key)))
                    .map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                </Select>
                <GenericMetricForm
                  metricType={metricCreationState.metricType}
                  metricCreationState={metricCreationState}
                  setMetricCreationState={setMetricCreationState}
                />
                {metricCreationState.metricDefinition.conditions.map(
                  (_, index) => (
                    <ConditionForm
                      key={index}
                      metricCreationState={metricCreationState}
                      setMetricCreationState={setMetricCreationState}
                      index={index}
                    />
                  )
                )}

                <Button
                  onPress={() => {
                    addStubConditionToState();
                  }}
                >
                  Add filtering condition
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    await createMetric({
                      variables: {
                        metric: {
                          metricType: metricCreationState.metricType,
                          stringifiedMetricDefinition: JSON.stringify(
                            metricCreationState.metricDefinition
                          ),
                          metricName: metricCreationState.metricName,
                        },
                      },
                    });
                    await refetch();
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
    </>
  );
}
