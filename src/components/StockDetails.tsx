// Chooses instructions, chart, or list based on current selection state.
import { store } from "../state";
import { ChartView } from "./ChartView";
import { Instructions } from "./Instructions";
import { ListView } from "./ListView";

export function StockDetails() {
  const count = store.selectedCount.value;
  const selected = store.selectedStock.value;

  return (
    <section class="h-full min-w-0 flex-1 overflow-hidden bg-zinc-100">
      {count === 0 ? <Instructions multi={false} /> : null}
      {count > 1 ? <Instructions multi={true} /> : null}
      {count === 1 && selected && store.viewMode.value === "chart" ? (
        <ChartView stock={selected} />
      ) : null}
      {count === 1 && selected && store.viewMode.value === "list" ? (
        <ListView stock={selected} />
      ) : null}
    </section>
  );
}
