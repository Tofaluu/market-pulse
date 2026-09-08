// Minimal command history used by store actions for undo/redo.
export type Command = {
  do: () => void;
  undo: () => void;
};

export class UndoManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(command: Command) {
    this.undoStack.push(command);
    this.redoStack = [];
  }

  undo() {
    const command = this.undoStack.pop();
    if (!command) return;
    this.redoStack.push(command);
    command.undo();
  }

  redo() {
    const command = this.redoStack.pop();
    if (!command) return;
    this.undoStack.push(command);
    command.do();
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }
}
