"use client";

export interface CostData {
  totalCost: number;
  breakdown: {
    retell: number;
    llm: number;
    transcription?: number;
  };
}

interface CostDisplayProps {
  cost: CostData | null;
}

function formatUSD(value: number): string {
  return `$${value.toFixed(4)}`;
}

export function CostDisplay({ cost }: CostDisplayProps): React.JSX.Element {
  if (!cost) {
    return <div className="text-sm text-gray-400">Cost: $0.0000</div>;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-semibold text-gray-700">{formatUSD(cost.totalCost)}</span>
      <span className="text-gray-400">|</span>
      <span className="text-gray-500" title="Retell telephony">
        Tel: {formatUSD(cost.breakdown.retell)}
      </span>
      <span className="text-gray-500" title="LLM tokens">
        LLM: {formatUSD(cost.breakdown.llm)}
      </span>
    </div>
  );
}
