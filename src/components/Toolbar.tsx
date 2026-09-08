// Top toolbar with actions and chart/list mode controls.
import { APP_TITLE } from "../constants";
import { store } from "../state";

type ToolbarProps = {
  onAdd: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

const buttonBase =
  "h-[25px] w-[44px] rounded-[3px] border border-zinc-500 bg-zinc-50 px-2 text-sm font-medium text-zinc-900 transition enabled:cursor-pointer enabled:hover:bg-zinc-200 enabled:active:bg-zinc-300";

export function Toolbar({ onAdd, onDelete, onUndo, onRedo }: ToolbarProps) {
  const canSingle = store.hasSingleSelection.value;
  const mode = store.viewMode.value;

  return (
    <header class="h-10 bg-zinc-300 px-3">
      <div class="flex h-full items-center gap-2">
        <h1 class="text-xl leading-none">{APP_TITLE}</h1>
        <div class="flex-1" />

        <button
          type="button"
          onClick={onUndo}
          disabled={!store.canUndo.value}
          class={`${buttonBase} disabled:cursor-default disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-100`}
        >
          ↩
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!store.canRedo.value}
          class={`${buttonBase} disabled:cursor-default disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-100`}
        >
          ↪
        </button>

        <div class="h-4 w-[2px] bg-zinc-700" />

        <button
          type="button"
          onClick={onAdd}
          disabled={!store.canAdd.value}
          class={`${buttonBase} disabled:cursor-default disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-100`}
        >
          Add
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={!store.canDelete.value}
          class={`${buttonBase} disabled:cursor-default disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-100`}
        >
          Del
        </button>

        <div class="h-4 w-[2px] bg-zinc-700" />

        <div class="flex items-center gap-2 text-sm">
          <div class="flex items-center gap-1">
            <span>Chart</span>
            <input
              type="radio"
              name="view-mode"
              class="accent-zinc-700 transition enabled:cursor-pointer enabled:hover:ring-1 enabled:hover:ring-zinc-400 enabled:active:scale-95 disabled:opacity-50"
              checked={mode === "chart"}
              disabled={!canSingle}
              onChange={() => store.setViewMode("chart")}
            />
          </div>
          <div class="flex items-center gap-1">
            <span>List</span>
            <input
              type="radio"
              name="view-mode"
              class="accent-zinc-700 transition enabled:cursor-pointer enabled:hover:ring-1 enabled:hover:ring-zinc-400 enabled:active:scale-95 disabled:opacity-50"
              checked={mode === "list"}
              disabled={!canSingle}
              onChange={() => store.setViewMode("list")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
