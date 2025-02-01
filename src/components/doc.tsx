import styles from "./doc.module.css";
import { useEffect, useRef } from "react";
// @ts-expect-error No types for this library
import { SuperDoc } from "@harbour-enterprises/superdoc";
import { Dialog } from "@radix-ui/themes";

export function DocDialog(props: { file: File; children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>{props.children}</Dialog.Trigger>
      <Dialog.Content maxWidth="11in" minHeight="11in">
        <Dialog.Title>{props.file.name}</Dialog.Title>
        <DocViewer file={props.file} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DocViewer(props: { file: File }) {
  const { file } = props;
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = new SuperDoc({
      selector: "#superdoc",
      documents: [
        {
          id: crypto.randomUUID(),
          type: "docx",
          data: file,
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
  }, [file]);

  return (
    <div className={styles["doc-container"]}>
      <div id="superdoc" className={styles["doc"]} />
    </div>
  );
}
