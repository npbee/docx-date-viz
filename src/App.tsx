import styles from "./app.module.css";
import { useApp } from "./state";
import { FilePicker } from "./components/file-picker";
import { Calendar } from "./components/calendar";
import { entriesFromFiles } from "./lib/calendar-entries";
import { Box, Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { Calendar as CalendarIcon, Frown } from "lucide-react";

export default function App() {
  const [app, send] = useApp();

  async function handleFiles(files: Array<File>) {
    try {
      send({ type: "parse-files" });
      const entries = await entriesFromFiles(files);
      send({ type: "parse-success", entries });
    } catch (err) {
      send({ type: "parse-fail", error: (err as Error).message });
    }
  }

  return (
    <Flex direction="column" height="100%">
      <header className={styles.header}>
        <Flex align="center" gap="2">
          <CalendarIcon
            size="24"
            style={{ stroke: "var(--accent-10)", fill: "var(--accent-1)" }}
          />
          <Heading size="2">Docx Date Visualizer</Heading>
        </Flex>
        {app.state === "parsed" ? (
          <FilePicker onPick={handleFiles} variant="button" />
        ) : null}
      </header>
      <main className={styles.main}>
        {app.state === "parsed" ? (
          <Calendar
            entries={app.entries}
            sort={app.sort}
            onSortChange={(sort) => send({ type: "sort", sort })}
            onActivateEntry={(id) => send({ type: "activate-entry", id })}
            onDeactivateEntry={(id) => send({ type: "deactivate-entry", id })}
            activeEntryId={app.activeEntryId}
            activeDate={app.activeDate}
            onSetDate={(date) => send({ type: "set-date", date })}
          />
        ) : null}
        {app.state === "init" ? (
          <Box p="5">
            <FilePicker onPick={handleFiles} />
          </Box>
        ) : null}
        {app.state === "error" ? (
          <Flex mx="auto" p="5" gap="2" direction="column">
            <Callout.Root color="red">
              <Callout.Icon>
                <Frown size="16" />
              </Callout.Icon>
              <Callout.Text>
                There was an error parsing the files.{" "}
              </Callout.Text>
            </Callout.Root>
            <FilePicker onPick={handleFiles} />
          </Flex>
        ) : null}
      </main>
    </Flex>
  );
}
