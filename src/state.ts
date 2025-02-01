import { useReducer } from "react";
import { CalendarEntry } from "./features/calendar/entries";
import { Doc } from "./features/doc/doc";

type InitState = {
  view: "init";
};

type ParsingState = {
  view: "parsing";
};

type ErrorState = {
  view: "error";
  error: string;
};

type CalendarState = {
  view: "cal";
  entries: Array<CalendarEntry>;
  docs: Array<Doc>;
};

type DocState = {
  view: "docs";
  docs: Array<Doc>;
  activeId?: string;
  entries: Array<CalendarEntry>;
};

export type AppState =
  | InitState
  | ParsingState
  | CalendarState
  | DocState
  | ErrorState;

type AppEvt =
  | { type: "parse-files" }
  | { type: "parse-success"; entries: Array<CalendarEntry>; docs: Array<Doc> }
  | { type: "parse-fail"; error: string }
  | { type: "show-docs"; id?: string }
  | { type: "show-cal" };

const appInitialState: AppState = {
  view: "init",
};

function appReducer(state: AppState, evt: AppEvt): AppState {
  switch (evt.type) {
    case "parse-files":
      return { view: "parsing" };
    case "parse-success": {
      return { view: "cal", entries: evt.entries, docs: evt.docs };
    }
    case "parse-fail": {
      return { view: "error", error: evt.error };
    }
    case "show-docs": {
      if (state.view !== "cal" && state.view !== "docs") {
        return state;
      }

      return {
        view: "docs",
        docs: state.docs,
        activeId: evt.id,
        entries: state.entries,
      };
    }
    case "show-cal": {
      if (state.view !== "docs") {
        return state;
      }

      return { view: "cal", entries: state.entries, docs: state.docs };
    }
    default: {
      return state;
    }
  }
}

export function useApp() {
  return useReducer(appReducer, appInitialState);
}
