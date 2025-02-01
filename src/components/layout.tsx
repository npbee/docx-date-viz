import { AppState } from "../state";
import { FilePicker } from "./file-picker";
import { cn } from "./utils";

export function Container(props: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-8">{props.children}</div>;
}

export function Header(props: {
  activeView: AppState["view"];
  onShowCal: () => void;
  onShowDocs: () => void;
  onPick: (files: Array<File>) => void;
}) {
  const { activeView, onShowDocs, onShowCal, onPick } = props;

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <h1 className="text-lg font-semibold">Docx Date Visualizer</h1>
          {activeView === "cal" || activeView === "docs" ? (
            <nav className="sm:ml-6 sm:flex sm:space-x-8 h-full">
              <div className="self-center">
                <FilePicker onPick={onPick} variant="button" />
              </div>
              <NavButton onClick={onShowCal} isCurrent={activeView === "cal"}>
                Calendar
              </NavButton>
              <NavButton onClick={onShowDocs} isCurrent={activeView === "docs"}>
                Docs
              </NavButton>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function Main(props: { children: React.ReactNode }) {
  return (
    <main className="flex-1 px-8 py-4 container mx-auto">{props.children}</main>
  );
}

export function NavButton(
  props: React.ComponentProps<"button"> & { isCurrent?: boolean },
) {
  const { isCurrent, ...rest } = props;

  return (
    <button
      aria-current={isCurrent ? "page" : undefined}
      {...rest}
      className={cn(
        "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700",
        isCurrent && "border-indigo-500 text-gray-900",
      )}
    />
  );
}
