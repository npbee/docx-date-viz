import { Calendar } from "./features/calendar/calendar";
import { useApp } from "./state";
import { FilePicker } from "./components/file-picker";
import { entriesFromFiles } from "./features/calendar/entries";
import * as Layout from "./components/layout";
import { docsFromFiles } from "./features/doc/doc";
import { Docs } from "./features/doc/doc";

// TODO:
// 1. Better snippets
// 2. Error handling
// 3. Pagination
export default function App() {
  const [app, send] = useApp();

  async function handleFiles(files: Array<File>) {
    try {
      send({ type: "parse-files" });
      const docs = docsFromFiles(files);
      const entries = await entriesFromFiles(docs);
      send({ type: "parse-success", entries, docs });
    } catch (err) {
      send({ type: "parse-fail", error: (err as Error).message });
    }
  }

  console.log(app.view);

  return (
    <Layout.Container>
      <Layout.Header
        activeView={app.view}
        onShowCal={() => send({ type: "show-cal" })}
        onShowDocs={() => send({ type: "show-docs" })}
        onPick={handleFiles}
      />
      <Layout.Main>
        {app.view === "cal" ? (
          <Calendar
            entries={app.entries}
            onViewDoc={(id) => send({ type: "show-docs", id })}
          />
        ) : null}
        {app.view === "docs" ? (
          <Docs
            onChangeDoc={(id) => send({ type: "show-docs", id })}
            docs={app.docs}
            activeId={app.activeId}
          />
        ) : null}
        {app.view === "init" ? (
          <div>
            <FilePicker onPick={handleFiles} />
          </div>
        ) : null}
      </Layout.Main>
    </Layout.Container>
  );
}
