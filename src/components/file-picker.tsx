import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "./button";

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
      {variant === "button" ? <Button>Choose files</Button> : null}
      {variant === "dropzone" ? (
        <div
          className="border-2 border-dashed rounded w-full h-[400px] text-gray-600 flex items-center justify-center flex-col gap-4 data-[drag-active=true]:border-green-700 data-[drag-active=true]:bg-green-50"
          data-drag-active={isDragActive}
        >
          <Upload size={32} />
          <p>Drop docx files here</p>
        </div>
      ) : null}
    </div>
  );
}
