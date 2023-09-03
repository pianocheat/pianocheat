import test from "node:test";
import assert from "assert";
import { fs as memFs } from "memfs";
import nativeFs from "fs";
import MusicXmlReader from "../reader/MusicXmlReader.js";

function getHelloWorldMusicXmlDocument(
  {
    addDoletFinaleCrashingXmlString = false,
  }: {
    addDoletFinaleCrashingXmlString?: boolean;
  } = {
    addDoletFinaleCrashingXmlString: false,
  }
) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 3.1 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>A</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>whole</type>
      </note>
      ${
        addDoletFinaleCrashingXmlString
          ? `<sound dynamics="83">
      <?DoletFinale Unknown text expression 5 associated with t
      t expression 5 associated with this sound at
      part P1, measure X8, edu 0?>
    </sound>`
          : ""
      }
      <note default-x="67.88" default-y="-30.00">
        <chord/>
        <pitch>
          <step>B</step>
          <octave>4</octave>
          </pitch>
        <duration>480</duration>
        <voice>2</voice>
        <type>quarter</type>
        <stem>down</stem>
        <staff>1</staff>
        </note>
      <forward>
        <duration>240</duration>
        </forward>
      <backup>
        <duration>720</duration>
        </backup>
         <note default-x="47.27" default-y="-40.00">
        <chord/>
        <pitch>
          <step>C</step>
          <octave>4</octave>
          </pitch>
        <duration>480</duration>
        <voice>2</voice>
        <type>quarter</type>
        <accidental>natural</accidental>
        <stem>down</stem>
        <staff>1</staff>
        </note>
         <note default-x="47.27" default-y="-40.00">
        <rest/>
        <duration>480</duration>
        <voice>2</voice>
        <type>quarter</type>
        <accidental>natural</accidental>
        <stem>down</stem>
        <staff>1</staff>
        </note>
         <note default-x="181.98" default-y="10.00">
        <pitch>
          <step>E</step>
          <octave>5</octave>
          </pitch>
        <duration>160</duration>
        <voice>1</voice>
        <type>eighth</type>
        <time-modification>
          <actual-notes>3</actual-notes>
          <normal-notes>2</normal-notes>
          </time-modification>
        <stem>down</stem>
        <staff>1</staff>
        <beam number="1">begin</beam>
        <notations>
          <tuplet type="start" bracket="no"/>
          </notations>
        </note>
    </measure>
  </part>
</score-partwise>`;
}

test(`throws on invalid file extension`, () => {
  assert.throws(() => new MusicXmlReader().readFile("test.pdf"), {
    message: /expected.*to have a valid.*file extension/i,
  });
});

test(`throws on invalid XML`, () => {
  memFs.writeFileSync("/test.xml", "!! {{> Not valid XML");
  assert.throws(
    () => new MusicXmlReader().readFile("/test.xml", { fs: memFs }),
    {
      message: /not a valid musicxml file/i,
    }
  );
});

test(`passes valid XML with processing instruction closing tag-less XML like <?DoletSibelius ?> which breaks the tXml parser`, () => {
  memFs.writeFileSync(
    "/test.xml",
    getHelloWorldMusicXmlDocument({ addDoletFinaleCrashingXmlString: true })
  );
  new MusicXmlReader().readFile("/test.xml", { fs: memFs });
});

test(`reads basic hello world MusicXML`, () => {
  memFs.writeFileSync("/test.musicxml", getHelloWorldMusicXmlDocument());
  const result = new MusicXmlReader().readFile("/test.musicxml", {
    fs: memFs,
  });
  assert.deepStrictEqual(result, [
    {
      tagName: "part-list",
      attributes: {},
      children: [
        {
          tagName: "score-part",
          attributes: {
            id: "P1",
          },
          children: [
            {
              tagName: "part-name",
              attributes: {},
              children: ["Music"],
            },
          ],
        },
      ],
    },
    {
      tagName: "part",
      attributes: {
        id: "P1",
      },
      children: [
        {
          tagName: "measure",
          attributes: {
            number: 1,
          },
          children: [
            {
              tagName: "attributes",
              attributes: {},
              children: [
                {
                  tagName: "divisions",
                  attributes: {},
                  children: [1],
                },
                {
                  tagName: "key",
                  attributes: {},
                  children: [
                    {
                      tagName: "fifths",
                      attributes: {},
                      children: [0],
                    },
                  ],
                },
                {
                  tagName: "time",
                  attributes: {},
                  children: [
                    {
                      tagName: "beats",
                      attributes: {},
                      children: [4],
                    },
                    {
                      tagName: "beat-type",
                      attributes: {},
                      children: [4],
                    },
                  ],
                },
                {
                  tagName: "clef",
                  attributes: {},
                  children: [
                    {
                      tagName: "sign",
                      attributes: {},
                      children: ["G"],
                    },
                    {
                      tagName: "line",
                      attributes: {},
                      children: [2],
                    },
                  ],
                },
              ],
            },
            {
              tagName: "note",
              attributes: {},
              children: [
                {
                  tagName: "pitch",
                  attributes: {},
                  children: [
                    {
                      tagName: "step",
                      attributes: {},
                      children: ["A"],
                    },
                    {
                      tagName: "octave",
                      attributes: {},
                      children: [4],
                    },
                  ],
                },
                {
                  tagName: "duration",
                  attributes: {},
                  children: [4],
                },
                {
                  tagName: "type",
                  attributes: {},
                  children: ["whole"],
                },
              ],
            },
            {
              tagName: "note",
              attributes: {
                defaultX: 67.88,
                defaultY: -30,
              },
              children: [
                {
                  tagName: "chord",
                  attributes: {},
                  children: [],
                },
                {
                  tagName: "pitch",
                  attributes: {},
                  children: [
                    {
                      tagName: "step",
                      attributes: {},
                      children: ["B"],
                    },
                    {
                      tagName: "octave",
                      attributes: {},
                      children: [4],
                    },
                  ],
                },
                {
                  tagName: "duration",
                  attributes: {},
                  children: [480],
                },
                {
                  tagName: "voice",
                  attributes: {},
                  children: [2],
                },
                {
                  tagName: "type",
                  attributes: {},
                  children: ["quarter"],
                },
                {
                  tagName: "stem",
                  attributes: {},
                  children: ["down"],
                },
                {
                  tagName: "staff",
                  attributes: {},
                  children: [1],
                },
              ],
            },
            {
              tagName: "forward",
              attributes: {},
              children: [
                {
                  tagName: "duration",
                  attributes: {},
                  children: [240],
                },
              ],
            },
            {
              tagName: "backup",
              attributes: {},
              children: [
                {
                  tagName: "duration",
                  attributes: {},
                  children: [720],
                },
              ],
            },
            {
              tagName: "note",
              attributes: {
                defaultX: 47.27,
                defaultY: -40,
              },
              children: [
                {
                  tagName: "chord",
                  attributes: {},
                  children: [],
                },
                {
                  tagName: "pitch",
                  attributes: {},
                  children: [
                    {
                      tagName: "step",
                      attributes: {},
                      children: ["C"],
                    },
                    {
                      tagName: "octave",
                      attributes: {},
                      children: [4],
                    },
                  ],
                },
                {
                  tagName: "duration",
                  attributes: {},
                  children: [480],
                },
                {
                  tagName: "voice",
                  attributes: {},
                  children: [2],
                },
                {
                  tagName: "type",
                  attributes: {},
                  children: ["quarter"],
                },
                {
                  tagName: "accidental",
                  attributes: {},
                  children: ["natural"],
                },
                {
                  tagName: "stem",
                  attributes: {},
                  children: ["down"],
                },
                {
                  tagName: "staff",
                  attributes: {},
                  children: [1],
                },
              ],
            },
            {
              tagName: "note",
              attributes: {
                defaultX: 47.27,
                defaultY: -40,
              },
              children: [
                {
                  tagName: "rest",
                  attributes: {},
                  children: [],
                },
                {
                  tagName: "duration",
                  attributes: {},
                  children: [480],
                },
                {
                  tagName: "voice",
                  attributes: {},
                  children: [2],
                },
                {
                  tagName: "type",
                  attributes: {},
                  children: ["quarter"],
                },
                {
                  tagName: "accidental",
                  attributes: {},
                  children: ["natural"],
                },
                {
                  tagName: "stem",
                  attributes: {},
                  children: ["down"],
                },
                {
                  tagName: "staff",
                  attributes: {},
                  children: [1],
                },
              ],
            },
            {
              tagName: "note",
              attributes: {
                defaultX: 181.98,
                defaultY: 10,
              },
              children: [
                {
                  tagName: "pitch",
                  attributes: {},
                  children: [
                    {
                      tagName: "step",
                      attributes: {},
                      children: ["E"],
                    },
                    {
                      tagName: "octave",
                      attributes: {},
                      children: [5],
                    },
                  ],
                },
                {
                  tagName: "duration",
                  attributes: {},
                  children: [160],
                },
                {
                  tagName: "voice",
                  attributes: {},
                  children: [1],
                },
                {
                  tagName: "type",
                  attributes: {},
                  children: ["eighth"],
                },
                {
                  tagName: "time-modification",
                  attributes: {},
                  children: [
                    {
                      tagName: "actual-notes",
                      attributes: {},
                      children: [3],
                    },
                    {
                      tagName: "normal-notes",
                      attributes: {},
                      children: [2],
                    },
                  ],
                },
                {
                  tagName: "stem",
                  attributes: {},
                  children: ["down"],
                },
                {
                  tagName: "staff",
                  attributes: {},
                  children: [1],
                },
                {
                  tagName: "beam",
                  attributes: {
                    number: 1,
                  },
                  children: ["begin"],
                },
                {
                  tagName: "notations",
                  attributes: {},
                  children: [
                    {
                      tagName: "tuplet",
                      attributes: {
                        type: "start",
                        bracket: false,
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});
