import styles from "./file-picker.module.css";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "@radix-ui/themes";

interface Props {
  onPick: (file: Array<File>) => void;
  variant?: "dropzone" | "button";
}

export function FilePicker(props: Props) {
  const { onPick, variant = "dropzone" } = props;

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    onPick(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {variant === "button" ? <Button size="1">Choose files</Button> : null}
      {variant === "dropzone" ? (
        <div className={styles.dropzone} data-drag-active={isDragActive}>
          <Upload size={32} />
          <p>Drop docx files here</p>
        </div>
      ) : null}
    </div>
  );
}
