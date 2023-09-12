import test from "ava";
import assert from "assert";
import { findNextMusicXmlDocumentMeasure } from "./MusicXmlDocumentReader.js";
import { readFileSync } from "fs";

function withNormalizedWhitespace(text: string) {
  return text
    .replace(/\r|\n/g, "")
    .replace(/ +/g, " ")
    .replace(/\> +\</g, "><");
}

test(`getMeasureXml() > `, (t) => {
  const documentContents = readFileSync(
    "resources/11 - Repeats.musicxml",
    "utf-8"
  );

  const expectedMeasure1Text = withNormalizedWhitespace(`<measure number="1">
    <barline location="left">
      <bar-style>heavy-light</bar-style>
      <repeat direction="forward"/>
      </barline>
    <attributes>
      <divisions>1</divisions>
      <key>
        <fifths>0</fifths>
        </key>
      <clef>
        <sign>G</sign>
        <line>2</line>
        </clef>
      </attributes>
    <note>
      <pitch>
        <step>C</step>
        <octave>4</octave>
        </pitch>
      <duration>4</duration>
      <voice>1</voice>
      <type>whole</type>
      </note>
    </measure>`);

  const expectedMeasure2Text = withNormalizedWhitespace(`<measure number="2">
    <note>
      <pitch>
        <step>D</step>
        <octave>4</octave>
        </pitch>
      <duration>4</duration>
      <voice>1</voice>
      <type>whole</type>
      </note>
    <barline location="right">
      <bar-style>light-heavy</bar-style>
      <repeat direction="backward"/>
      </barline>
    </measure>`);

  const expectedMeasure3Text = withNormalizedWhitespace(`<measure number="3">
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
          </pitch>
        <duration>4</duration>
        <voice>1</voice>
        <type>whole</type>
        </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
        <repeat direction="backward"/>
        </barline>
      </measure>`);

  const { text: measure1Text, endingMatchIndex: measure1EndingMatchIndex } =
    findNextMusicXmlDocumentMeasure(documentContents, 0);
  t.deepEqual(withNormalizedWhitespace(measure1Text), expectedMeasure1Text);

  const { text: measure2Text, endingMatchIndex: measure2EndingMatchIndex } =
    findNextMusicXmlDocumentMeasure(documentContents, measure1EndingMatchIndex);
  t.deepEqual(withNormalizedWhitespace(measure2Text), expectedMeasure2Text);

  const { text: measure3Text } = findNextMusicXmlDocumentMeasure(
    documentContents,
    measure2EndingMatchIndex
  );
  t.deepEqual(withNormalizedWhitespace(measure3Text), expectedMeasure3Text);
});
