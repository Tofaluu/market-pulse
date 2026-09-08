// Left-side stock list; clicking empty background clears selection.
import { formatPrice, formatSignedChange, changeArrow } from "../format";
import { store } from "../state";

type StockListProps = {
  onBackgroundClick: () => void;
};

export function StockList({ onBackgroundClick }: StockListProps) {
  const stocks = store.stocks.value;

  return (
    <aside
      class="h-full w-[280px] shrink-0 overflow-y-auto bg-zinc-300 p-[2px]"
      onClick={(event) => {
        if (event.currentTarget === event.target) onBackgroundClick();
      }}
    >
      {stocks.map((stock) => {
        const selected = store.isSelected(stock.symbol);
        const change = formatSignedChange(stock.change);
        const arrow = changeArrow(stock.change);
        return (
          <button
            key={stock.symbol}
            type="button"
            class={`mb-[5px] flex h-[60px] w-full flex-col justify-center rounded-none px-[10px] text-left transition-colors ${
              selected
                ? "bg-zinc-500 text-zinc-50 hover:bg-zinc-600 active:bg-zinc-700"
                : "bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300"
            }`}
            onClick={(event) => {
              store.clickStock(stock.symbol, event.shiftKey);
              event.stopPropagation();
            }}
          >
            <div class="text-base leading-5">{stock.name} ({stock.symbol})</div>
            <div class="text-xs leading-4">
              {formatPrice(stock.price)} ({change}{arrow})
            </div>
          </button>
        );
      })}
    </aside>
  );
}
