import path from "path";
import {
  PreProcessedXmlReaderElement,
  XmlReaderElementResult,
  getNextXmlElement,
  readXmlDocument,
} from "./XmlDocumentReader.js";
import {
  MusicXmlPitchStep,
  MusicXmlPitchToNumber,
  MusicXmlPitchToString,
  upperCaseFirstLetter,
} from "./Utils.js";

export type RepeatEvent = {
  event: "repeat";
  direction: "forward" | "backward";
  measure: number;
};
export type NoteEvent = {
  event: "note";
  pitch?: number;
  rest?: boolean;
  grace?: boolean;
  chord?: boolean;
  cue?: boolean;
  step?: string;
  alter?: number;
  octave?: number;
  duration: number;
  staff: number;
  accidental?: string;
  timeModification?: boolean;
  arpeggiate?: boolean;
  measure: number;
};
export type ForwardEvent = {
  event: "forward";
  duration: number;
  measure: number;
};
export type BackupEvent = {
  event: "backup";
  duration: number;
  measure: number;
};
export type DraftScoreEvent =
  | RepeatEvent
  | NoteEvent
  | ForwardEvent
  | BackupEvent;

export function readMusicXmlDocument(contents: string) {
  let scoreEvents = createDraftScoreEventsFromMusicXmlDocument(contents);
  convertNoteStepAlterOctavesToPitchNumbers(scoreEvents);
  const eventsMap = processAndRemoveBackupForwardScoreEvents(scoreEvents);
  removeRestNotes(eventsMap);
  return eventsMap;
}

export function removeRestNotes(eventsMap: Record<string, NoteEvent[]>) {
  for (const timecode of Object.keys(eventsMap)) {
    const notes = eventsMap[timecode];
    eventsMap[timecode] = notes.filter((x) => !x.rest);
  }
}

export function convertNoteStepAlterOctavesToPitchNumbers(
  events: DraftScoreEvent[]
) {
  for (const entry of events) {
    if (entry.event === "note" && !entry.rest) {
      const { step, alter, octave } = entry;
      if (!step) {
        throw new Error(
          `Trying to convert a note from properties step, alter, and octave to a numerical pitch, but the note has no step property. The note is: ${JSON.stringify(
            entry,
            null,
            4
          )}.`
        );
      } else if (!octave) {
        throw new Error(
          `Trying to convert a note from properties step, alter, and octave to a numerical pitch, but the note has no octave property. The note is: ${JSON.stringify(
            entry,
            null,
            4
          )}.`
        );
      } else {
        entry.pitch = MusicXmlPitchToNumber({
          step: step as MusicXmlPitchStep,
          alter,
          octave,
        });
      }
      delete entry.step;
      delete entry.alter;
      delete entry.octave;
    }
  }
}

export function processAndRemoveBackupForwardScoreEvents(
  events: DraftScoreEvent[]
) {
  let measureRepeatEvent;
  let eventsMap: Record<number, NoteEvent[]> = {};
  let clock = 0;

  let previousNote: NoteEvent;

  function advanceClock(duration: number): void {
    clock += duration;
  }

  function rewindClock(duration: number): void {
    clock -= duration;
  }

  function getClockLogic({
    prevNote,
    note,
  }: {
    prevNote?: NoteEvent;
    note: NoteEvent;
  }) {
    const isStartingChord = !!note.chord && !prevNote?.chord;
    const wasChordEnded = !!prevNote?.chord && !note.chord;
    const shouldRewindLastAppliedDuration = isStartingChord;
    const shouldForwardLastUnappliedDuration = wasChordEnded;
    const shouldAdvanceClock = !note.chord;

    return {
      shouldRewindLastAppliedDuration,
      shouldForwardLastUnappliedDuration,
      shouldAdvanceClock,
    };
  }

  function onBeforeAddNote({
    prevNote,
    note,
  }: {
    prevNote?: NoteEvent;
    note: NoteEvent;
  }) {
    if (note.staff == null) {
      throw new Error("Note staff cannot be null.");
      note.staff = 1;
    }

    if (note.grace) {
      note.duration = 0;
    }

    const {
      shouldRewindLastAppliedDuration,
      shouldForwardLastUnappliedDuration,
    } = getClockLogic({ prevNote, note });

    if (shouldRewindLastAppliedDuration && prevNote) {
      rewindClock(prevNote.duration);
    }

    if (shouldForwardLastUnappliedDuration && prevNote) {
      advanceClock(prevNote.duration);
    }
  }

  function onAddNote({ note }: { note: NoteEvent }) {
    if (note.cue) {
      return;
    }

    eventsMap[clock] ||= [];
    const notes = eventsMap[clock];
    notes.push(note);
  }

  function onAfterAddNote({
    prevNote,
    note,
  }: {
    prevNote?: NoteEvent;
    note: NoteEvent;
  }) {
    const { shouldAdvanceClock } = getClockLogic({ prevNote, note });

    if (shouldAdvanceClock) {
      advanceClock(note.duration);
    }
  }

  function processNote(note: NoteEvent) {
    const prevNote = previousNote;
    previousNote = note;

    onBeforeAddNote({ prevNote, note });
    onAddNote({ note });
    onAfterAddNote({ prevNote, note });
  }

  for (const entry of events) {
    switch (entry.event) {
      case "repeat":
        measureRepeatEvent = entry;
        break;
      case "backup":
        clock -= entry.duration;
        break;
      case "forward":
        clock += entry.duration;
        break;
      case "note":
        processNote(entry);
        break;
    }
  }

  return eventsMap;
}

export function createDraftScoreEventsFromMusicXmlDocument(contents: string) {
  let allXmlElements = readXmlDocument(contents);

  const xmlElementsForMeasure = [];
  let scoreEvents: DraftScoreEvent[] = [];

  let measureNumber = 1;
  for (const element of allXmlElements) {
    const isClosingMeasureElement =
      element.tag === "measure" && element.type === "close";

    if (isClosingMeasureElement) {
      scoreEvents = scoreEvents.concat(
        createDraftScoreEventsFromMeasureXml(
          xmlElementsForMeasure,
          measureNumber
        )
      );
      xmlElementsForMeasure.length = 0;
    } else {
      xmlElementsForMeasure.push(element);
    }
  }

  return scoreEvents;
}

const IGNORED_MUSICXML_ELEMENTS = new Set([
  "pitch",
  "accent",
  "appearance",
  "beam",
  "stem",
  "voice",
  "tuplet",
  "slur",
  "type",
  "accidental",
  "tenuto",
  "timeModification",
  "actualNotes",
  "normalNotes",
  "staccato",
  "articulations",
  "ornaments",
  "notations",
]);

export function createDraftScoreEventsFromMeasureXml(
  elements: PreProcessedXmlReaderElement[],
  measure: number
) {
  let index = 0;

  const events: DraftScoreEvent[] = [];

  do {
    let currentElement = elements[index];

    switch (currentElement.tag) {
      case "repeat":
        events.push({
          event: "repeat",
          direction: (currentElement.attributes as any).direction,
          measure,
        });
        break;
      case "note":
        let subIndex = index + 1;
        let nextElement = elements[subIndex];
        let noteData: any = {};

        do {
          nextElement = elements[subIndex];

          if (nextElement.type === "close") {
            if (nextElement.tag === "note") {
              break;
            }
            subIndex += 1;
            continue;
          }

          if (!IGNORED_MUSICXML_ELEMENTS.has(nextElement.tag)) {
            noteData[nextElement.tag] =
              nextElement.value != null ? nextElement.value : true;
            for (const [key, value] of Object.entries(
              nextElement.attributes || {}
            )) {
              noteData[`${nextElement.tag}${upperCaseFirstLetter(key)}`] =
                Number.isNaN(Number(value)) ? value : Number(value);
            }
          }

          subIndex += 1;
        } while (subIndex < elements.length);

        index = subIndex;
        events.push({ event: "note", measure, ...noteData });
        break;
      case "forward":
        const forwardDuration = elements[index + 1].value;
        events.push({
          event: "forward",
          measure,
          duration: Number(forwardDuration),
        });
        index += 2;
        break;
      case "backup":
        const backupDuration = elements[index + 1].value;
        events.push({
          event: "backup",
          measure,
          duration: Number(backupDuration),
        });
        index += 2;
        break;
    }
    index += 1;
  } while (index < elements.length);

  return events;
}
