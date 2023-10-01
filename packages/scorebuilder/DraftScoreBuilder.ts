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
  pitchStr?: string;
  rest?: boolean;
  grace?: boolean;
  chord?: boolean;
  timecode?: number;
  cue?: boolean;
  step?: string;
  alter?: number;
  octave?: number;
  duration: number;
  staff: number;
  accidental?: string;
  tied?: boolean;
  tiedType?: "start" | "stop" | "continue";
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
  adjustTiedStartNoteDurations(eventsMap);
  removeTiedStopAndContinueNotesAndTiedStartAttributes(eventsMap);
  removeRestNotes(eventsMap);
  removeEmptyMeasures(eventsMap);
  removeChordAttribute(eventsMap);
  sortNotesInMeasure(eventsMap);
  return eventsMap;
}

export function adjustTiedStartNoteDurations(
  eventsMap: Record<string, NoteEvent[]>
) {
  const notesToAdjust: any = {};

  for (const timecode of Object.keys(eventsMap)) {
    const notes = eventsMap[timecode];

    for (let idx = 0; idx < notes.length; idx++) {
      const note = notes[idx];

      if (!note.tied) {
        continue;
      }

      const keyPath = `${note.staff}/${note.pitch}`;
      if (note.tiedType === "start") {
        // Mark and remember any "start" tied note, we will be adjusting its duration
        notesToAdjust[keyPath] = {
          idx,
          timecode: note.timecode,
          staff: note.staff,
          pitch: note.pitch,
        };
      } else {
        // Found a "stop" or "continue" tied note

        // Find its original "start" note and adjust its duration
        const noteAdjustmentInfo = notesToAdjust[keyPath];
        const {
          idx: noteToBeAdjustedIdx,
          timecode,
          staff,
          pitch,
        } = noteAdjustmentInfo as any;
        const foundNoteToBeAdjusted = eventsMap[timecode][noteToBeAdjustedIdx];

        if (!foundNoteToBeAdjusted) {
          throw new Error(
            "Could not find tied note to increase duration of based on index calculated when iterating over notes earlier."
          );
        }

        const isSameNote =
          foundNoteToBeAdjusted.staff === staff &&
          foundNoteToBeAdjusted.pitch === pitch;

        if (!isSameNote) {
          throw new Error(
            "Adjusting tied note in notes data did not match cached info of tied notes built up when iterating over notes earlier."
          );
        }

        foundNoteToBeAdjusted.duration += note.duration;

        // If it's a "stop" tied note, clear the remembered start note to make room for the next tied note later in the song
        if (note.tiedType === "stop") {
          delete notesToAdjust[keyPath];
        }
      }
    }
  }

  for (const noteToAdjust of Object.values(notesToAdjust)) {
    const { idx, timecode, duration, staff, pitch } = noteToAdjust as any;
    const foundNoteToBeAdjusted = eventsMap[timecode][idx];

    if (!foundNoteToBeAdjusted) {
      throw new Error(
        "Could not find tied note to increase duration of based on index calculated when iterating over notes earlier."
      );
    }

    const isSameNote =
      foundNoteToBeAdjusted.staff === staff &&
      foundNoteToBeAdjusted.pitch === pitch;

    if (!isSameNote) {
      throw new Error(
        "Adjusting tied note in notes data did not match cached info of tied notes built up when iterating over notes earlier."
      );
    }

    foundNoteToBeAdjusted.duration = duration;
  }
}

export function removeTiedStopAndContinueNotesAndTiedStartAttributes(
  eventsMap: Record<string, NoteEvent[]>
) {
  for (const timecode of Object.keys(eventsMap)) {
    const notes = eventsMap[timecode];
    eventsMap[timecode] = notes.filter((x) => {
      if (!x.tiedType) {
        return true;
      } else if (x.tiedType === "start") {
        delete x.tied;
        delete x.tiedType;
        return true;
      }
    });
  }
}

export function removeRestNotes(eventsMap: Record<string, NoteEvent[]>) {
  for (const timecode of Object.keys(eventsMap)) {
    const notes = eventsMap[timecode];
    eventsMap[timecode] = notes.filter((x) => !x.rest);
  }
}

export function removeEmptyMeasures(eventsMap: Record<string, NoteEvent[]>) {
  for (const timecode of Object.keys(eventsMap)) {
    const notes = eventsMap[timecode];
    if (!notes.length) {
      delete eventsMap[timecode];
    }
  }
}

export function removeChordAttribute(eventsMap: Record<string, NoteEvent[]>) {
  for (const notes of Object.values(eventsMap)) {
    for (const note of notes) {
      delete note.chord;
    }
  }
}

export function sortNotesInMeasure(eventsMap: Record<string, NoteEvent[]>) {
  for (const timecode of Object.keys(eventsMap)) {
    const notes = eventsMap[timecode];
    eventsMap[timecode] = notes.sort(
      (a, b) => (b?.pitch || 0) - (a?.pitch || 0)
    );
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
        entry.pitchStr = MusicXmlPitchToString({
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
      // Single-staff music may not have a staff property
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
    note.timecode = clock;

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
      measureNumber += 1;
    } else {
      xmlElementsForMeasure.push(element);
    }
  }

  return scoreEvents;
}

const IGNORED_NOTE_KEYS_STARTS_WITH = [
  "tieT", // tieType & tieTimeOnly
  "stacca", // staccato & staccatissimo
  "fermata",
  "fingering",
  "slur",
  "beam",
  "strongAccent",
  "tuplet",
];

const IGNORED_NOTE_KEYS_STARTS_WITH_AFTER = ["wavyLine", "grace"];

const IGNORED_NOTE_KEYS_EXACT_MATCH = new Set(
  [
    // The <tie> element indicates sound; the <tied> element indicates notation
    ["tie"],
    // We are only interested in the specific notations or ornaments, not that there are any
    ["notations", "ornaments"],
    // Which hand plays a note is determined by the staff (treble or bass cleff), not by the voice
    ["voice"],
    ["dot"],
    ["stem"],
    ["type"],
    ["technical"],
    ["articulations"],
    ["timeModification", "actualNotes", "normalNotes"],
    ["accidental"],
    ["accent"],
  ].flat()
);

function getNoteWithTransformedProperties(note: any) {
  if (
    Array.isArray(note.tiedType) &&
    note.tiedType.length > 1 &&
    (note.tiedType[0] === "start" || note.tiedType[0] === "stop") &&
    (note.tiedType[1] === "start" || note.tiedType[1] === "stop") &&
    note.tiedType[0] !== note.tiedType[1]
  ) {
    note.tiedType = "continue";
  }

  if (note.trillMark || note.wavyLine) {
    delete note.trillMark;
    delete note.wavyLine;
    note.trill = true;
  }

  return note;
}

function getNoteWithoutIgnoredProperties(note: any) {
  const newNote: any = {};
  for (const key of Object.keys(note)) {
    let isKeyBlacklisted = false;
    if (IGNORED_NOTE_KEYS_EXACT_MATCH.has(key)) {
      isKeyBlacklisted = true;
    } else {
      for (const ignoredKeyStartsWithAfter of IGNORED_NOTE_KEYS_STARTS_WITH_AFTER) {
        if (
          key !== ignoredKeyStartsWithAfter &&
          key.startsWith(ignoredKeyStartsWithAfter)
        ) {
          isKeyBlacklisted = true;
          break;
        }
      }
      for (const ignoredKeyStartsWith of IGNORED_NOTE_KEYS_STARTS_WITH) {
        if (key.startsWith(ignoredKeyStartsWith)) {
          isKeyBlacklisted = true;
          break;
        }
      }
    }

    if (!isKeyBlacklisted) {
      newNote[key] = note[key];
    }
  }
  return newNote;
}

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

          noteData[nextElement.tag] =
            nextElement.value != null ? nextElement.value : true;
          for (const [key, value] of Object.entries(
            nextElement.attributes || {}
          )) {
            const keyPath = `${nextElement.tag}${upperCaseFirstLetter(key)}`;
            const existingValue = noteData[keyPath];
            const entryAddition = Number.isNaN(Number(value))
              ? value
              : Number(value);

            if (existingValue) {
              if (!Array.isArray(existingValue)) {
                noteData[keyPath] = [existingValue];
              }
              noteData[keyPath].push(entryAddition);
            } else {
              noteData[keyPath] = entryAddition;
            }
          }

          subIndex += 1;
        } while (subIndex < elements.length);

        index = subIndex;

        noteData = getNoteWithoutIgnoredProperties(noteData);
        noteData = getNoteWithTransformedProperties(noteData);
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
