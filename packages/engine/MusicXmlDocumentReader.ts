import path from "path";
import { getNextXmlElement } from "./XmlDocumentReader.js";

const Strings = {
  StartMeasureTag: "<measure",
  EndMeasureTag: "</measure",
  OpeningTag: "<",
  ClosingTag: ">",
};

export function readMusicXmlDocument(contents: string) {
  let element;

  while (
    (element = getNextXmlElement({
      xml: contents,
      startingIndex: contents.indexOf("<measure"),
    }))
  ) {}
}

interface MusicXmlDocumentMeasureSearchResult {
  found: boolean;
  text: string;
  startingMatchIndex: number;
  endingMatchIndex: number;
  searchString: string;
  startingSearchIndex: number;
}
