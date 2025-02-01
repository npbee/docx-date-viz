// @ts-expect-error No types for this library
import mammoth from "mammoth/mammoth.browser";
import * as chrono from "chrono-node";
import { Doc } from "../doc/doc";

export interface CalendarEntry {
  id: string;
  rawText: string;
  snippet: string;
  doc: Doc;
  date: Date;
}

export async function entriesFromFiles(
  docs: Array<Doc>,
): Promise<Array<CalendarEntry>> {
  const resultsPerFile = await Promise.all(
    docs.map((doc) => entriesFromDoc(doc)),
  );

  return resultsPerFile.flat();
}

async function entriesFromDoc(doc: Doc): Promise<Array<CalendarEntry>> {
  const paragraphs = await extractDocxParagraphs(doc);

  return paragraphs
    .flatMap((p) => entriesFromParagraph(p, doc))
    .filter((entry) => entry !== null);
}

function entriesFromParagraph(text: string, doc: Doc): Array<CalendarEntry> {
  const parseResult = chrono.parse(text);

  const entries = parseResult.map((result) => {
    const entry = {
      id: crypto.randomUUID(),
      rawText: text,
      // TODO: Better snippet
      snippet: text.slice(Math.max(result.index - 20, 0), 20),
      doc,
      date: result.start.date(),
    };
    return entry;
  });

  return entries;
}

/**
 * Extract the raw text from a docx file. This will return plain text with
 * paragraphs separated by newlines.
 */
async function extractDocxParagraphs(doc: Doc): Promise<Array<string>> {
  const buffer = await fileToArrayBuffer(doc.file);
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const rawText: string = result.value;
  return rawText.split("\n").filter((p) => p.length > 0);
}

/**
 * Convert a File to an ArrayBuffer. Mammoth needs an ArrayBuffer in the browser
 */
async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer)) {
        throw new Error("Unexpected result type");
      }
      resolve(result);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsArrayBuffer(file);
  });
}
