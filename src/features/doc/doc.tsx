import { useEffect, useRef } from "react";
// @ts-expect-error No types for this library
import { SuperDoc } from "@harbour-enterprises/superdoc";

export interface Doc {
  id: string;
  file: File;
}

export function docsFromFiles(files: Array<File>): Array<Doc> {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    file,
  }));
}

export function Docs(props: {
  docs: Array<Doc>;
  activeId?: string;
  onChangeDoc: (id: string) => void;
}) {
  const { docs, activeId = docs[0].id, onChangeDoc } = props;
  const activeDoc = docs.find((doc) => doc.id === activeId);

  if (!activeDoc) {
    return null;
  }

  return (
    <div className="flex">
      <ul className="min-w-[200px] bg-gray-50 p-4">
        {docs.map((doc) => (
          <li
            key={doc.id}
            className="data-[active=true]:font-semibold"
            data-active={doc.id === activeId}
          >
            <button onClick={() => onChangeDoc(doc.id)}>{doc.file.name}</button>
          </li>
        ))}
      </ul>
      <div className="flex-1 mx-auto">
        <DocViewer doc={activeDoc} />
      </div>
    </div>
  );
}

function DocViewer(props: { doc: Doc }) {
  const { doc } = props;
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = new SuperDoc({
      selector: "#superdoc",
      documents: [
        {
          id: doc.id,
          type: "docx",
          data: doc.file,
        },
      ],
    });

    editorRef.current = editor;

    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, [doc]);

  return (
    <div className="">
      <div
        id="superdoc"
        className="w-fit shadow-lg border border-gray-300 rounded"
      />
    </div>
  );
}
