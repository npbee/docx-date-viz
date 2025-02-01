// @ts-expect-error No types for this library
import mammoth from "mammoth/mammoth.browser";
import parser from "any-date-parser";
import * as chrono from "chrono-node";

export interface CalendarEntry {
  id: string;
  rawText: string;
  snippet: string;
  file: File;
  date: Date;
}

/**
 * Extract calendar entries from a list of files.
 */
export async function entriesFromFiles(
  files: Array<File>,
): Promise<Array<CalendarEntry>> {
  const resultsPerFile = await Promise.all(
    files.map((file) => entriesFromFile(file)),
  );

  return resultsPerFile.flat();
}

/**
 * Extract calendar entries from a single file.
 */
async function entriesFromFile(file: File): Promise<Array<CalendarEntry>> {
  const paragraphs = await extractDocxParagraphs(file);

  return paragraphs
    .flatMap((p) => entriesFromParagraph(p, file))
    .filter((entry) => entry !== null);
}

/**
 * Extract calendar entries from a single paragraph.
 */
function entriesFromParagraph(
  paragraph: string,
  file: File,
): Array<CalendarEntry> {
  return (
    chrono.strict
      .parse(paragraph)
      .map((result) => ({
        id: crypto.randomUUID(),
        rawText: result.text,
        snippet: extractSnippet(paragraph, result.index, result.text),
        file,
        date: result.start.date(),
      }))
      // The `chrono` library will find relative dates like "Tomorrow at 7pm"
      // which aren't useful for this use case. I'm using a second date parser
      // to parse the text that chrono found, so that we can only include
      // absolute dates
      .filter((entry) => {
        const d = parser.attempt(entry.rawText);
        return d.day && d.month && d.year;
      })
  );
}

/**
 * Extract a snippet from a paragraph. This is used to show a preview of the
 * paragraph in the calendar.
 */
function extractSnippet(
  paragraph: string,
  index: number,
  text: string,
): string {
  const previousWords = paragraph.slice(0, index).trim().split(" ").slice(-10);
  const followingWords = paragraph
    .slice(index + text.length)
    .trim()
    .split(" ")
    .slice(0, 10);

  const snippet = [...previousWords, text, ...followingWords].join(" ");

  return `...${snippet}...`;
}

/**
 * Extract the raw text from a docx file. This will return plain text with
 * paragraphs separated by newlines.
 */
async function extractDocxParagraphs(file: File): Promise<Array<string>> {
  const buffer = await fileToArrayBuffer(file);
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
