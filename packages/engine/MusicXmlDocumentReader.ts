import path from "path";
import {
  PreProcessedXmlReaderElement,
  XmlReaderElementResult,
  getNextXmlElement,
  readXmlDocument,
} from "./XmlDocumentReader.js";
import { upperCaseFirstLetter } from "./Utils.js";

export function readMusicXmlDocument(contents: string) {
  let elements = readXmlDocument(contents);

  const measureElements = [];

  for (const element of elements) {
    measureElements.push(element);
    if (element.tag === "measure" && element.type === "close") {
      readMusicXmlMeasure(measureElements);
    }
  }
}

export type MusicXmlNote = {
  rest?: boolean;
  duration?: number;
  staff?: number;
  step?: string;
  alter?: number;
  octave?: number;
};
export type MusicXmlMeasure = {
  repeatDirection?: "backward" | "forward";
  // notes:
};

export function readMusicXmlMeasure(elements: PreProcessedXmlReaderElement[]) {
  let needle = 0;
  let measure: MusicXmlMeasure = {};

  const events = [];

  do {
    let element = elements[needle];

    switch (element.tag) {
      case "repeat":
        measure.repeatDirection = (element.attributes as any).direction;
        break;
      case "note":
        let noteNeedle = needle;
        noteNeedle += 1;
        let noteSubElement = elements[noteNeedle];
        let noteData: MusicXmlNote = {};
        do {
          noteSubElement = elements[noteNeedle];
          if (noteSubElement.type === "close") {
            if (noteSubElement.tag === "note") {
              break;
            }
            noteNeedle += 1;
            continue;
          }
          switch (noteSubElement.tag) {
            case "pitch":
            case "beam":
            case "stem":
            case "staff":
            case "type":
            case "ornaments":
            case "notations":
              break;
            default:
              (noteData as any)[noteSubElement.tag] =
                noteSubElement.value != null ? noteSubElement.value : true;
              for (const [key, value] of Object.entries(
                noteSubElement.attributes || {}
              )) {
                (noteData as any)[
                  `${noteSubElement.tag}${upperCaseFirstLetter(key)}`
                ] = Number.isNaN(Number(value)) ? value : Number(value);
              }
              break;
          }
          noteNeedle += 1;
        } while (noteNeedle < elements.length);
        needle = noteNeedle;
        events.push({ ...noteData, ...{ event: "note" } });
        break;
      case "forward":
        const forwardDuration = elements[needle + 1].value;
        events.push({ event: "forward", duration: forwardDuration });
        needle += 2;
        break;
      case "backup":
        const backupDuration = elements[needle + 1].value;
        events.push({ event: "backup", duration: backupDuration });
        needle += 2;
        break;
    }
    needle += 1;
  } while (needle < elements.length);

  console.log("events:", events);
}

interface MusicXmlDocumentMeasureSearchResult {
  found: boolean;
  text: string;
  startingMatchIndex: number;
  endingMatchIndex: number;
  searchString: string;
  startingSearchIndex: number;
}
