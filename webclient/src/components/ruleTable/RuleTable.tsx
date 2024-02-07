import { commonColors } from "@nextui-org/react";
import { OPERATOR_DISPLAY_MAP } from "../../types/shared";

function joinStringList(list: string[]) {
  if (list.length === 1) {
    return list[0];
  }
  if (list.length === 2) {
    return `${list[0]} and ${list[1]}`;
  }
  return `${list.slice(0, list.length - 1).join(", ")}, and ${list.slice(-1)}`;
}

function ActionStringList({ actionNames }: { actionNames: string[] }) {
  if (actionNames.length === 1) {
    return (
      <p>
        <span className="underline">{actionNames[0]}</span>.
      </p>
    );
  }
  if (actionNames.length === 2) {
    return (
      <p>
        <span className="underline">{actionNames[0]}</span> and{" "}
        <span className="underline">{actionNames[1]}</span>.
      </p>
    );
  }
  return (
    <p>
      <span className="underline">
        {actionNames.slice(0, actionNames.length - 1).join(", ")}
      </span>
      , and <span className="underline">{actionNames.slice(-1)}</span>.
    </p>
  );
}

function RulesRow({
  ruleName,
  ruleActionNames,
  thresholds,
  ruleID,
}: {
  ruleName: string[];
  ruleActionNames: string[];
  thresholds: {
    metricName: string;
    operator: string;
    value: number;
    metricID: string;
  }[];
  ruleID: string;
}) {
  return (
    <div
      style={{ backgroundColor: commonColors.zinc[200], marginBottom: 16 }}
      className="p-4"
    >
      <p className="text-xl font-bold">{ruleName}</p>
      <p>when</p>

      {thresholds.map((t, index) => (
        <p>
          {index > 0 && "and "}
          <span className="font-bold">{t.metricName}</span>{" "}
          {OPERATOR_DISPLAY_MAP[t.operator]} {t.value},
        </p>
      ))}
      <div style={{ flexDirection: "row" }}></div>
      <ActionStringList actionNames={ruleActionNames} />
    </div>
  );
}

export default function RuleTable({ rulesData }: { rulesData: any }) {
  if (!rulesData) {
    return null;
  }
  return (
    <div className="p-8">
      {rulesData.getRules.map((rule: any) => (
        <RulesRow
          key={`rules-row-${rule.ruleID}`}
          ruleName={rule.name}
          ruleActionNames={rule.ruleActions.map((ra: any) => ra.name)}
          thresholds={rule.thresholds.map((t: any) => ({
            metricName: t.metricName,
            operator: t.operator,
            value: t.value,
            metricID: t.metricID,
          }))}
          ruleID={rule.ruleID}
        />
      ))}
    </div>
  );
}
