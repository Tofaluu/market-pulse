// Instruction panels for no-selection and multi-selection states.
import { MULTI_SELECT_TEXT, WELCOME_TEXT } from "../constants";

type InstructionsProps = {
  multi: boolean;
};

export function Instructions({ multi }: InstructionsProps) {
  if (multi) {
    return (
      <div class="p-6">
        <p class="mb-4">{MULTI_SELECT_TEXT.title}</p>
        <ul class="list-disc pl-6">
          {MULTI_SELECT_TEXT.points.map((point, index) => {
            if (index === 1) {
              return (
                <li key={point}>
                  Press <em>Del</em> to delete all selected Stocks from the list.
                </li>
              );
            }

            return <li key={point}>{point}</li>;
          })}
        </ul>
      </div>
    );
  }

  return (
    <div class="p-6">
      <h2 class="mb-2 text-2xl">{WELCOME_TEXT.title}</h2>
      <p>{WELCOME_TEXT.subtitle}</p>

      <h3 class="mt-5 mb-2 text-lg">Supported actions</h3>
      <ul class="list-disc pl-6">
        {WELCOME_TEXT.supported.map((point, index) => {
          if (index === 0) {
            return (
              <li key={point}>
                Use the <em>Add</em> and <em>Del</em> buttons to add or remove a stock.
              </li>
            );
          }

          return <li key={point}>{point}</li>;
        })}
      </ul>

      <h3 class="mt-5 mb-2 text-lg">Keyboard shortcuts</h3>
      <ul class="list-disc pl-6">
        {WELCOME_TEXT.shortcuts.map((point) => {
          const [shortcut, ...rest] = point.split(" - ");
          const description = rest.join(" - ");

          if (!description) {
            return <li key={point}>{point}</li>;
          }

          return (
            <li key={point}>
              <em>{shortcut}</em> - {description}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
