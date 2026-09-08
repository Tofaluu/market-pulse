// Single-stock list mode: yearly market cap table and year-over-year change.
import { changeArrow, formatMarketCapFromNumber, formatMarketCapFromString, formatPrice, formatSignedChange } from "../format";
import type { Stock } from "../stocks";

type ListViewProps = {
  stock: Stock;
};

export function ListView({ stock }: ListViewProps) {
  return (
    <div class="flex h-full min-h-0 flex-col p-6">
      <div class="ml-8 mb-3 space-y-1 text-[14pt]">
        <div class="text-[16pt]">{stock.name} ({stock.symbol})</div>
        <div>Market cap: {formatMarketCapFromString(stock.mcap)}</div>
        <div>
          Stock price: {formatPrice(stock.price)} ({formatSignedChange(stock.change)}{changeArrow(stock.change)})
        </div>
      </div>

      <div class="mt-3 ml-10 mr-5 min-h-0 flex-1 overflow-auto">
        <table class="w-full border-collapse bg-zinc-50 text-center text-[12pt]">
          <thead>
            <tr>
              <th class="px-2 py-2 font-bold">Year</th>
              <th class="px-2 py-2 font-bold">Market Cap</th>
              <th class="px-2 py-2 font-bold">Change</th>
            </tr>
          </thead>
          <tbody>
            {stock.history.map((point, index) => {
              const prev = stock.history[index - 1];
              const change = prev ? point.mcap - prev.mcap : null;
              return (
                <tr key={point.year}>
                  <td class="px-2 py-2">{point.year}</td>
                  <td class="px-2 py-2">{formatMarketCapFromNumber(point.mcap)}</td>
                  <td class="px-2 py-2">
                    {change === null
                      ? "n/a"
                      : `${formatSignedChange(change)} ${changeArrow(change)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
