export function withNormalizedWhitespace(text: string) {
  return text
    .replace(/\r|\n/g, "")
    .replace(/ +/g, " ")
    .replace(/\> +\</g, "><")
    .trim();
}

export function upperCaseFirstLetter(text: string) {
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

export function camelize(str: string) {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}

/**
 * 	Pitch is represented as a combination of the step of the diatonic scale, the chromatic alteration, and the octave.
 */
export interface MusicXmlPitch {
  step: MusicXmlPitchStep;
  /**
   * The alter element represents chromatic alteration in number of semitones (e.g., -1 for flat, 1 for sharp). Decimal values like 0.5 (quarter tone sharp) are used for microtones. The octave element is represented by the numbers 0 to 9, where 4 indicates the octave started by middle C.  In the first example below, notice an accidental element is used for the third note, rather than the alter element, because the pitch is not altered from the the pitch designated to that staff position by the key signature.
   */
  alter?: number;
  /**
   * Octaves are represented by the numbers 0 to 9, where 4 indicates the octave started by middle C.
   */
  octave: number;
}

/**
 * 	The step type represents a step of the diatonic scale, represented using the English letters A through G.
 */
export enum MusicXmlPitchStep {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
}

export function PitchStringToNumber(s: string): number {
  const OCTAVE_SEMITONES: number = 12;
  const C0_VALUE: number = 12; /* MIDI defines C0 as 12 */
  const octave: number = parseFloat(s[s.length - 1]);

  const valueForOctave: number = C0_VALUE + octave * OCTAVE_SEMITONES;

  let stepSemitone: number;
  switch (s[0]) {
    case "C":
      stepSemitone = 0;
      break;
    case "D":
      stepSemitone = 2;
      break;
    case "E":
      stepSemitone = 4;
      break;
    case "F":
      stepSemitone = 5;
      break;
    case "G":
      stepSemitone = 7;
      break;
    case "A":
      stepSemitone = 9;
      break;
    case "B":
      stepSemitone = 11;
      break;
    default:
      throw new Error(
        `Received a string pitch to parse with a step of ${s[0]}`
      );
  }

  const numberOfSharps = Array.from(s).filter((x) => x == "#").length;
  const numberOfFlats = Array.from(s).filter((x) => x == "b").length;

  const alterSemitoneForSharps = numberOfSharps;
  const alterSemitoneForFlats = -numberOfFlats;

  return (
    valueForOctave +
    stepSemitone +
    alterSemitoneForSharps +
    alterSemitoneForFlats
  );
}

export function MusicXmlPitchToString(pitch: MusicXmlPitch): string {
  const { step, alter, octave } = pitch;
  return `${step.toLowerCase()}${
    alter === -1 ? "♭" : alter === 1 ? "♯" : ""
  }${octave}`;
}

export function MusicXmlPitchToNumber(pitch: MusicXmlPitch): number {
  if (!pitch || !pitch.step) {
    throw new Error("No pitch or step found, cannot convert.");
  }

  const { octave, alter, step } = pitch;

  const OCTAVE_SEMITONES: number = 12;
  const C0_VALUE: number = 12; /* MIDI defines C0 as 12 */

  const valueForOctave: number = C0_VALUE + octave * OCTAVE_SEMITONES;

  let stepSemitone: number;
  switch (step) {
    case "C":
      stepSemitone = 0;
      break;
    case "D":
      stepSemitone = 2;
      break;
    case "E":
      stepSemitone = 4;
      break;
    case "F":
      stepSemitone = 5;
      break;
    case "G":
      stepSemitone = 7;
      break;
    case "A":
      stepSemitone = 9;
      break;
    case "B":
      stepSemitone = 11;
      break;
    default:
      throw new Error(`Received a pitch with a step of ${step}.`);
  }

  /* alter is a decimal, but microtonal alters aren't supported in a piano */
  const alterSemitone: number =
    alter != null && alter !== 0 ? Math.floor(alter) : 0;

  return valueForOctave + stepSemitone + alterSemitone;
}
