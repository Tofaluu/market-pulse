// Bottom status bar showing selected stock price and list counts.
import { formatPrice } from "../format";
import { store } from "../state";

export function StatusBar() {
  const selected = store.selectedStock.value;

  return (
    <footer class="flex h-10 items-center justify-between border-t border-zinc-400 bg-zinc-300 px-3 text-sm">
      <div>
        {selected ? `${selected.name}: ${formatPrice(selected.price)}` : ""}
      </div>
      <div>{store.statusLabel.value}</div>
    </footer>
  );
}
