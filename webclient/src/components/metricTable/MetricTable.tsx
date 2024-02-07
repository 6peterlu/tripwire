import { ApolloQueryResult, gql, useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { deserializeMetricGraphQL } from "../../utils/metrics";
import {
  Condition,
  CountMetric,
  MetricType,
  MetricUnion,
  UniqueValuesMetric,
} from "../../types/metrics";
import { commonColors } from "@nextui-org/theme";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { BarChart } from "@tremor/react";
import { OPERATOR_DISPLAY_MAP } from "../../types/shared";

const QUERY_GET_METRIC_VALUES = gql`
  query GetMetricValues($metricID: String!) {
    getMetricValueHistogram(metricID: $metricID) {
      value
    }
  }
`;
const MUTATION_DELETE_METRIC = gql`
  mutation DeleteMetric($metricID: String!) {
    deleteMetric(metricID: $metricID)
  }
`;

function ConditionsDisplay({ conditions }: { conditions: Condition[] }) {
  return (
    <div>
      {conditions.map((condition) => (
        <p>
          {condition.transformFunction.arguments[0] as string}{" "}
          {OPERATOR_DISPLAY_MAP[condition.operator]} {condition.value}
        </p>
      ))}
    </div>
  );
}

function CountMetricRow({ countMetric }: { countMetric: CountMetric }) {
  return (
    <>
      <p>Count metric</p>
      <p>Event type: {countMetric.eventType}</p>
      <p>Time window: {countMetric.timeWindowSeconds / 60} minutes</p>
      {countMetric.conditions.length > 0 && (
        <>
          <p>Additional filtering conditions:</p>
          <ConditionsDisplay conditions={countMetric.conditions} />
        </>
      )}
    </>
  );
}

function UniqueValuesMetricRow({
  uniqueValuesMetric,
}: {
  uniqueValuesMetric: UniqueValuesMetric;
}) {
  return (
    <>
      <p>Unique values metric</p>
      <p>Event type: {uniqueValuesMetric.eventType}</p>
      <p>Time window: {uniqueValuesMetric.timeWindowSeconds / 60} minutes</p>
      <p>
        Field: {uniqueValuesMetric.transformFunction.arguments[0] as string}
      </p>
      <ConditionsDisplay conditions={uniqueValuesMetric.conditions} />
    </>
  );
}

function MetricRow({
  metricType,
  metricDefinition,
  metricName,
  metricID,
  refetch,
}: {
  metricType: MetricType;
  metricDefinition: MetricUnion;
  metricName: string;
  metricID: string;
  refetch: () => Promise<ApolloQueryResult<any>>;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deleteMetric] = useMutation(MUTATION_DELETE_METRIC);
  const { data, refetch: getMetricValuesRefetch } = useQuery(
    QUERY_GET_METRIC_VALUES,
    {
      variables: { metricID: metricID },
    }
  );
  const histogramFormattedData = useMemo(() => {
    const chartData: { [key: number]: number } = {};
    for (const value of data?.getMetricValueHistogram ?? []) {
      chartData[value.value] = (chartData[value.value] ?? 0) + 1;
    }
    const histogramData: { value: number; frequency: number }[] = [];
    let lastValue: number | null = null;
    for (const [value, frequency] of Object.entries(chartData)) {
      if (lastValue && Number(value) - lastValue > 1) {
        // push all values in between
        for (let i = lastValue + 1; i < Number(value); i++) {
          histogramData.push({ value: i, frequency: 0 });
        }
      }
      lastValue = Number(value);
      histogramData.push({ value: Number(value), frequency });
    }

    return histogramData;
  }, [data]);
  // refetch every 5 seconds
  useMemo(() => {
    const interval = setInterval(() => {
      getMetricValuesRefetch();
    }, 1000);
    return () => clearInterval(interval);
  }, [getMetricValuesRefetch]);
  return (
    <>
      <div
        style={{
          backgroundColor: commonColors.zinc[200],
          margin: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: "bold" }}>{metricName}</p>
          <p>{metricType} metric</p>
        </div>

        <Button onPress={onOpen}>{"See details >>"}</Button>
      </div>
      <BarChart
        className="mt-6"
        data={histogramFormattedData}
        index="value"
        categories={["frequency"]}
        colors={["blue"]}
        yAxisWidth={48}
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {metricName}
              </ModalHeader>
              <ModalBody>
                {metricType === MetricType.Count && (
                  <CountMetricRow
                    countMetric={metricDefinition as CountMetric}
                  />
                )}
                {metricType === MetricType.UniqueValues && (
                  <UniqueValuesMetricRow
                    uniqueValuesMetric={metricDefinition as UniqueValuesMetric}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onPress={async () => {
                    await deleteMetric({
                      variables: {
                        metricID,
                      },
                    });
                    await refetch();
                    onClose();
                  }}
                >
                  Delete
                </Button>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default function MetricTable({
  data,
  refetch,
}: {
  data: any;
  refetch: () => Promise<ApolloQueryResult<any>>;
}) {
  const deserializedMetrics = useMemo(() => {
    if (data) {
      // TODO: get graphql types to FE so these are not all any types
      return data.getMetrics.map((metric: any) => ({
        ...metric,
        metricDefinition: deserializeMetricGraphQL(
          metric.metricType,
          metric.stringifiedMetricDefinition
        ),
      }));
    }
    return [];
  }, [data]);
  return (
    <div>
      {deserializedMetrics.map((metric: any) => (
        <MetricRow
          key={metric.metricID}
          metricType={metric.metricType}
          metricName={metric.metricName}
          metricDefinition={metric.metricDefinition}
          metricID={metric.metricID}
          refetch={refetch}
        />
      ))}
    </div>
  );
}
