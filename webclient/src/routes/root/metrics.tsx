import { gql, useQuery } from "@apollo/client";
import "../../App.css";
import AddMetricButton from "../../components/createMetricModal/AddMetricButton";
import MetricTable from "../../components/metricTable/MetricTable";

const QUERY_GET_METRICS = gql`
  query GetMetrics {
    getMetrics {
      metricID
      metricType
      stringifiedMetricDefinition
      metricName
    }
  }
`;

function Metrics() {
  const { data, refetch } = useQuery(QUERY_GET_METRICS);
  return (
    <div className="App">
      <MetricTable data={data} refetch={refetch} />
      <AddMetricButton refetch={refetch} />
    </div>
  );
}

export default Metrics;
