import test from "ava";
import assert from "assert";
import { readFileSync } from "fs";
import { readMusicXmlDocument } from "./MusicXmlDocumentReader.js";

test(`readMusicXmlDocument() > `, (t) => {
  readMusicXmlDocument(`
  <measure number="3">
    <note>
      <pitch>
        <step>C</step>
        <octave>4</octave>
        </pitch>
      <duration>1</duration>
      <voice>1</voice>
      <type>quarter</type>
      <stem>up</stem>
      <staff>1</staff>
      <beam number="1">continue</beam>
      <beam number="2">continue</beam>
      <notations>
      <arpeggiate direction="down"/>
        <ornaments>
          <tremolo type="single">3</tremolo>
          </ornaments>
        </notations>
      </note>
    <note>
      <rest/>
      <duration>1</duration>
      <voice>1</voice>
      <type>quarter</type>
      <staff>1</staff>
      </note>
      <backup>
        <duration>4</duration>
        </backup>
    <note>
    <grace/>
      <pitch>
        <step>C</step>
        <octave>5</octave>
        </pitch>
      <duration>1</duration>
      <voice>1</voice>
      <type>quarter</type>
      <stem>down</stem>
      <staff>1</staff>
      </note>
    <note>
      <rest/>
      <duration>1</duration>
      <voice>1</voice>
      <type>quarter</type>
      <staff>1</staff>
      </note>
    <backup>
      <duration>4</duration>
      </backup>
      <forward>
        <duration>8</duration>
        </forward>
    <note>
      <rest/>
      <duration>4</duration>
      <voice>5</voice>
      <type>whole</type>
      <staff>2</staff>
      </note>
  </measure>
  `);
  t.fail();
});
