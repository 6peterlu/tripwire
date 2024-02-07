import CreateRuleButton from "../../components/createRuleModal/CreateRuleButton";
import RuleTable from "../../components/ruleTable/RuleTable";
import { gql, useQuery } from "@apollo/client";

const GET_RULES = gql`
  query GetRules {
    getRules {
      ruleID
      name
      thresholds {
        metricID
        operator
        value
        metricName
      }
      ruleActions {
        ruleActionID
        name
      }
    }
  }
`;

export default function Rules() {
  const { data: rulesData, refetch: rulesDataRefetch } = useQuery(GET_RULES);
  return (
    <div>
      <RuleTable rulesData={rulesData} />
      <div className="flex flex-col items-center">
        <CreateRuleButton rulesDataRefetch={rulesDataRefetch} />
      </div>
    </div>
  );
}
