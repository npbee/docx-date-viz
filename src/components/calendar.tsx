import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import styles from "./calendar.module.css";
import { CalendarEntry } from "../lib/calendar-entries";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import {
  Button,
  Popover,
  Heading,
  Text,
  Blockquote,
  Flex,
  Select,
  Grid,
  Box,
} from "@radix-ui/themes";

import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { createContext, useContext, useMemo } from "react";
import { ParsedState } from "../state";
import { DocDialog } from "./doc";
import { Calendar as CalendarIcon } from "lucide-react";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

type Props = {
  entries: Array<CalendarEntry>;
  sort: ParsedState["sort"];
  activeEntryId?: string | null;
  activeDate: Date;
  onSortChange: (sort: ParsedState["sort"]) => void;
  onActivateEntry: (id: string) => void;
  onDeactivateEntry: (id: string) => void;
  onSetDate: (date: Date) => void;
};

const CalendarContext = createContext<{
  activeEntryId: string | null | undefined;
  onActivateEntry: (id: string) => void;
  onDeactivateEntry: (id: string) => void;
}>({
  activeEntryId: undefined,
  onActivateEntry: () => {},
  onDeactivateEntry: () => {},
});

export function Calendar(props: Props) {
  const {
    entries,
    sort,
    onSortChange,
    activeDate,
    activeEntryId,
    onActivateEntry,
    onDeactivateEntry,
    onSetDate,
  } = props;

  // `react-big-calendar` requires a specific event format
  const events = entries.map((entry) => ({
    id: entry.id,
    start: entry.date,
    end: entry.date,
    entry: entry,
  }));

  return (
    <Grid columns={{ initial: "1", md: "1fr 350px" }} height="100%">
      <Box overflowY="auto">
        <Box
          height={{
            initial: "400px",
            sm: "100%",
          }}
          minHeight={{
            sm: "400px",
          }}
          p="5"
        >
          <CalendarContext.Provider
            value={{ activeEntryId, onActivateEntry, onDeactivateEntry }}
          >
            <BigCalendar
              views={["month"]}
              localizer={localizer}
              events={events}
              date={activeDate}
              onNavigate={onSetDate}
              components={{
                event: CalendarEvent,
              }}
            />
          </CalendarContext.Provider>
        </Box>
      </Box>
      <EntrySidebar
        entries={entries}
        sort={sort}
        onSortChange={onSortChange}
        activeEntryId={activeEntryId}
        onActivateEntry={onActivateEntry}
      />
    </Grid>
  );
}

function CalendarEvent(props: { event: { entry: CalendarEntry } }) {
  const { event } = props;
  const { entry } = event;
  const ctx = useContext(CalendarContext);

  return (
    <Popover.Root
      open={ctx.activeEntryId === event.entry.id}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          ctx.onActivateEntry(event.entry.id);
        } else {
          ctx.onDeactivateEntry(event.entry.id);
        }
      }}
    >
      <Popover.Trigger>
        <Button variant="ghost" size="1">
          <Box p="1" as="span" aria-hidden="true">
            &bull;
          </Box>
          {event.entry.file.name}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start">
        <Flex direction="column" gap="3">
          <Text size="2" weight="bold">
            {formatDate(entry.date)}
          </Text>
          <Snippet snippet={entry.snippet} rawText={entry.rawText} />
          <div>
            <DocDialog file={entry.file}>
              <Button variant="ghost">{entry.file.name}</Button>
            </DocDialog>
          </div>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}

function Snippet(props: { snippet: string; rawText: string }) {
  const { snippet, rawText } = props;
  const leadingSnippet = snippet.slice(0, snippet.indexOf(rawText));
  const trailingSnippet = snippet.slice(
    snippet.indexOf(rawText) + rawText.length,
  );

  return (
    <Blockquote>
      <Text size="1">{leadingSnippet}</Text>
      <Text size="1" weight="bold">
        {rawText}
      </Text>
      <Text size="1">{trailingSnippet}</Text>
    </Blockquote>
  );
}

function EntrySidebar(props: {
  entries: Array<CalendarEntry>;
  sort: ParsedState["sort"];
  onSortChange: (sort: ParsedState["sort"]) => void;
  activeEntryId?: string | null;
  onActivateEntry: (id: string) => void;
}) {
  const { entries, sort, onSortChange, onActivateEntry, activeEntryId } = props;

  const sortedEntries = useMemo(() => {
    if (sort === "none") {
      return entries;
    } else if (sort === "asc") {
      return entries
        .slice()
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      return entries
        .slice()
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }, [sort, entries]);

  return (
    <div className={styles.sidebar}>
      <div className={styles["sidebar-header"]}>
        <Flex gap="2">
          <CalendarIcon size="16" />
          <Heading size="2" as="h2" weight="medium">
            All dates
          </Heading>
        </Flex>
        <Flex align="center" gap="2">
          <Text
            as="label"
            size="1"
            color="gray"
            weight="medium"
            htmlFor="event-sort"
          >
            Sort
          </Text>
          <Select.Root
            size="1"
            value={sort}
            onValueChange={(val) =>
              onSortChange(val as "asc" | "desc" | "none")
            }
          >
            <Select.Trigger id="event-sort" />
            <Select.Content>
              <Select.Item value="asc">Ascending</Select.Item>
              <Select.Item value="desc">Descending</Select.Item>
              <Select.Item value="none">None</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </div>
      <ul className={styles["entry-list"]}>
        {sortedEntries.map((entry) => (
          <li
            key={entry.id}
            className={styles.event}
            data-active={entry.id === activeEntryId}
          >
            <button
              className={styles.entryActivationBtn}
              onClick={() => onActivateEntry(entry.id)}
            >
              <span className={styles.hitbox} />
              <Text size="2" weight="bold">
                {formatDate(entry.date)}
              </Text>
            </button>
            <Snippet snippet={entry.snippet} rawText={entry.rawText} />
            <div>
              <DocDialog file={entry.file}>
                {/**
                 * `position: relative` is required here so that the
                 * button is accessible on top of the clickable entry
                 */}
                <Button variant="ghost" style={{ position: "relative" }}>
                  {entry.file.name}
                </Button>
              </DocDialog>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
