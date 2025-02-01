import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarEntry } from "./entries";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/popover";
import { Button } from "../../components/button";

import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { createContext, useContext, useState } from "react";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

type Props = {
  entries: Array<CalendarEntry>;
  onViewDoc: (id: string) => void;
};

const CalendarContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onViewDoc: (_id: string) => {},
  selectedId: null as string | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedId: (_id: string | null) => {},
});

export function Calendar(props: Props) {
  const { entries, onViewDoc } = props;
  const events = entries.map((entry) => ({
    id: entry.id,
    start: entry.date,
    end: entry.date,
    entry: entry,
  }));
  const [selectedId, setSelectedId] = useState<string | null>(events?.[0]?.id);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    events?.[0]?.start,
  );

  return (
    <div className="h-[800px] space-y-4">
      <CalendarContext.Provider
        value={{ onViewDoc, selectedId: selectedId, setSelectedId }}
      >
        <BigCalendar
          localizer={localizer}
          events={events}
          date={selectedDate}
          onNavigate={(date) => setSelectedDate(date)}
          components={{
            event: CalendarEvent,
          }}
        />
        <div className="flex gap-4 items-center justify-between">
          <div className="text-sm font-medium">
            {entries.length} dates found
          </div>
          <Button
            onClick={() => {
              setSelectedId(events?.[0]?.id);
              setSelectedDate(events?.[0]?.start);
            }}
          >
            Go to first date
          </Button>
        </div>
      </CalendarContext.Provider>
    </div>
  );
}

function CalendarEvent(props: { event: { entry: CalendarEntry } }) {
  const { event } = props;
  const ctx = useContext(CalendarContext);

  return (
    <Popover
      open={ctx.selectedId === event.entry.id}
      onOpenChange={(isOpen) =>
        ctx.setSelectedId(isOpen ? event.entry.id : null)
      }
    >
      <PopoverTrigger asChild>
        <button className="w-full">{event.entry.doc.file.name}</button>
      </PopoverTrigger>
      <PopoverContent>
        <EntryDetails entry={event.entry} />
      </PopoverContent>
    </Popover>
  );
}

function EntryDetails(props: { entry: CalendarEntry }) {
  const { entry } = props;
  const ctx = useContext(CalendarContext);

  return (
    <div className="space-y-4 min-w-[300px]">
      <div className="space-y-2">
        <div className="font-semibold">{entry.doc.file.name}</div>
        <p className="text-sm">{entry.snippet}</p>
      </div>
      <Button
        onClick={() => {
          ctx.onViewDoc(entry.doc.id);
        }}
      >
        View document
      </Button>
    </div>
  );
}
