import { readMusicXmlDocument } from "scorebuilder";

export type Timecode = number;

export interface Note {
  measure: number;
  pitch: number;
  duration: number;
  staff: number;
  pitchStr: string;
  timecode: number;
  grace?: boolean;
  arpeggiate?: boolean;
  trill?: boolean;
  mordent?: boolean;
  invertedMordent?: boolean;
}

export interface PianoScore {
  timewise: Record<Timecode, Note[]>;
}

export function createFromMusicXmlDocument(contents: string) {
  const noteEvents = readMusicXmlDocument(contents);

  return {
    timewise: noteEvents as Record<Timecode, Note[]>,
  };
}
