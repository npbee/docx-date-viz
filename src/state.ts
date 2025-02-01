import { useReducer } from "react";
import { CalendarEntry } from "./lib/calendar-entries";

type InitState = {
  state: "init";
};

type ParsingState = {
  state: "parsing";
};

type ErrorState = {
  state: "error";
  error: string;
};

export type ParsedState = {
  state: "parsed";

  /**
   * The parsed entries from the files
   */
  entries: Array<CalendarEntry>;

  /**
   * Current sort of the entries in the sidebar
   */
  sort: "asc" | "desc" | "none";

  /**
   * The entry that's currently displaying in the calendar
   */
  activeEntryId?: string | null;

  /**
   * The date that controls which month the calendar is showing
   */
  activeDate: Date;
};

export type AppState = InitState | ParsingState | ParsedState | ErrorState;

type AppEvt =
  | { type: "parse-files" }
  | { type: "parse-success"; entries: Array<CalendarEntry> }
  | { type: "parse-fail"; error: string }
  | { type: "sort"; sort: ParsedState["sort"] }
  | { type: "activate-entry"; id: string }
  | { type: "deactivate-entry"; id: string }
  | { type: "set-date"; date: Date };

const appInitialState: AppState = {
  state: "init",
};

function appReducer(state: AppState, evt: AppEvt): AppState {
  switch (evt.type) {
    case "parse-files":
      return { state: "parsing" };
    case "parse-success": {
      return {
        state: "parsed",
        entries: evt.entries,
        sort: "none",
        activeEntryId: evt.entries[0]?.id ?? null,
        activeDate: evt.entries[0]?.date ?? new Date(),
      };
    }
    case "parse-fail": {
      return { state: "error", error: evt.error };
    }
    case "sort": {
      if (state.state !== "parsed") {
        return state;
      }
      return { ...state, sort: evt.sort };
    }
    case "activate-entry": {
      if (state.state !== "parsed") {
        return state;
      }
      // Find the start date of the entry so we can set the active date
      const entry = state.entries.find((e) => e.id === evt.id);

      if (!entry) {
        // Sanity check, we should always have an entry
        return state;
      }

      // Set the active date to the start date of the entry
      return { ...state, activeEntryId: evt.id, activeDate: entry.date };
    }
    case "deactivate-entry": {
      if (state.state !== "parsed") {
        return state;
      }
      // Find the start date of the entry so we can set the active date
      if (state.activeEntryId !== evt.id) {
        return state;
      }

      return { ...state, activeEntryId: null };
    }
    case "set-date": {
      if (state.state !== "parsed") {
        return state;
      }
      return { ...state, activeDate: evt.date };
    }
    default: {
      return state;
    }
  }
}

export function useApp() {
  return useReducer(appReducer, appInitialState);
}
