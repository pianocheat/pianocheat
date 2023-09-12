import test from "ava";
import assert from "assert";
import { readFileSync } from "fs";

function withNormalizedWhitespace(text: string) {
  return text
    .replace(/\r|\n/g, "")
    .replace(/ +/g, " ")
    .replace(/\> +\</g, "><");
}

// test(`readMusicXmlDocument() > `, (t) => {
//   // const expectedMeasure1Text = withNormalizedWhitespace(`<measure number="1">
//   //   <barline location="left">
//   //     <bar-style>heavy-light</bar-style>
//   //     <repeat direction="forward"/>
//   //     </barline>
//   //   <attributes>
//   //     <divisions>1</divisions>
//   //     <key>
//   //       <fifths>0</fifths>
//   //       </key>
//   //     <clef>
//   //       <sign>G</sign>
//   //       <line>2</line>
//   //       </clef>
//   //     </attributes>
//   //   <note>
//   //     <pitch>
//   //       <step>C</step>
//   //       <octave>4</octave>
//   //       </pitch>
//   //     <duration>4</duration>
//   //     <voice>1</voice>
//   //     <type>whole</type>
//   //     </note>
//   //   </measure>`);
//   // t.deepEqual(withNormalizedWhitespace(measure3Text), expectedMeasure3Text);
// });
