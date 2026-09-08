// App entry point: mount the root Preact component.
import { render } from "preact";
import { App } from "./App";
import "./styles.css";

render(<App />, document.querySelector("div#app") as HTMLElement);
