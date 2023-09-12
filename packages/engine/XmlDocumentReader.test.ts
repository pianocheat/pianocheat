import test from "ava";
import { upperCaseFirstLetter } from "./Utils.js";
import { getNextXmlElement } from "./XmlDocumentReader.js";

test(`getNextXmlElement() > should return null for an empty string`, (t) => {
  t.is(getNextXmlElement({ xml: "", startingIndex: 0 }), null);
});

test(`getNextXmlElement() > should return null for invalid XML with a space between < and the tag name`, (t) => {
  t.is(getNextXmlElement({ xml: "   < tag >", startingIndex: 0 }), null);
});

test(`getNextXmlElement() > should return tag`, (t) => {
  t.like(
    getNextXmlElement({ debug: false, xml: "   <tag >", startingIndex: 0 }),
    { tag: "tag" }
  );
});

test(`getNextXmlElement() > should return tag with one attribute`, (t) => {
  t.like(
    getNextXmlElement({ debug: false, xml: "<tag a='b'>", startingIndex: 0 }),
    { tag: "tag", attributes: { a: "b" } }
  );
});

test(`getNextXmlElement() > should return tag with multiple attribute with coerced number attribute values`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: "<tag a='1' b='2' c='3'>",
      startingIndex: 0,
    }),
    { tag: "tag", attributes: { a: 1, b: 2, c: 3 } }
  );
});

test(`getNextXmlElement() > should return tag with multiple attribute with coerced number attribute values with whitespaces`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `
          <tag
       a  = '1 '

       b =   '2'>`,
      startingIndex: 0,
    }),
    { tag: "tag", attributes: { a: 1, b: 2 } }
  );
});

test(`getNextXmlElement() > should handle simple self-closing tag, no spaces`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `
          <tag/>`,
      startingIndex: 0,
    }),
    { tag: "tag" }
  );
});

test(`getNextXmlElement() > should handle simple self-closing tag, whitespaces before closing tag`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `
          <tag
            />`,
      startingIndex: 0,
    }),
    { tag: "tag" }
  );
});

test(`getNextXmlElement() > should handle self-closing tag, complex whitespaces with attributes`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `
          <tag
       a  = '1 '

       b =   '2'/>`,
      startingIndex: 0,
    }),
    { tag: "tag", attributes: { a: 1, b: 2 } }
  );
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `
          <tag
       a  = '1 '

       b =   '2'

         />`,
      startingIndex: 0,
    }),
    { tag: "tag", attributes: { a: 1, b: 2 } }
  );
});

test(`getNextXmlElement() > should get child values`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `<tag>123</tag>`,
      startingIndex: 0,
    }),
    { tag: "tag", value: 123 }
  );
});

test(`getNextXmlElement() > should get child values with spaces`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `<tag>  123 a</tag>`,
      startingIndex: 0,
    }),
    { tag: "tag", value: "  123 a" }
  );
});

test(`getNextXmlElement() > should break down a complete XMl document line-by-line`, (t) => {
  const xmlDocument = `
<part id="P1">
  <measure number="1">
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
    <sound dynamics="83">
      <?DoletFinale Unknown text expression 5 associated with t
      t expression 5 associated with this sound at
      part P1, measure X8, edu 0?>
    </sound>
    <note>
      <pitch>
        <step>C</step>
        <octave>4</octave>
      </pitch>
      <duration>4</duration>
      <voice>1</voice>
      <type>whole</type>
    </note>
    <note>
      <pitch>
        <step>D</step>
        <octave>5</octave>
      </pitch>
      <duration>4</duration>
      <voice>1</voice>
      <type>whole</type>
    </note>
  </measure>
</part>`;

  let element;
  let needle = 0;

  const elements = [];

  while (
    (element = getNextXmlElement({
      debug: false,
      xml: xmlDocument,
      startingIndex: needle,
    }))
  ) {
    elements.push(element);
    needle = element.endingIndex;
  }

  t.like(elements, [
    {
      tag: "part",
      type: "open",
      endingIndex: 14,
      attributes: { id: "P1" },
    },
    {
      tag: "measure",
      type: "open",
      endingIndex: 37,
      attributes: { number: 1 },
    },
    {
      tag: "barline",
      type: "open",
      endingIndex: 67,
      attributes: { location: "left" },
    },
    { tag: "bar", type: "open", endingIndex: 79 },
    { tag: "bar", type: "close", endingIndex: 102 },
    {
      tag: "repeat",
      type: "open-close",
      endingIndex: 143,
      attributes: { direction: "forward" },
    },
    { tag: "barline", type: "close", endingIndex: 159 },
    { tag: "attributes", type: "open", endingIndex: 176 },
    { tag: "divisions", type: "open", endingIndex: 194, value: 1 },
    { tag: "divisions", type: "close", endingIndex: 207 },
    { tag: "key", type: "open", endingIndex: 219 },
    { tag: "fifths", type: "open", endingIndex: 236 },
    { tag: "fifths", type: "close", endingIndex: 246 },
    { tag: "key", type: "close", endingIndex: 259 },
    { tag: "clef", type: "open", endingIndex: 272 },
    { tag: "sign", type: "open", endingIndex: 287, value: "G" },
    { tag: "sign", type: "close", endingIndex: 295 },
    { tag: "line", type: "open", endingIndex: 310, value: 2 },
    { tag: "line", type: "close", endingIndex: 318 },
    { tag: "clef", type: "close", endingIndex: 332 },
    { tag: "attributes", type: "close", endingIndex: 350 },
    {
      tag: "sound",
      type: "open",
      endingIndex: 376,
      value:
        "\n" +
        "      <?DoletFinale Unknown text expression 5 associated with t\n" +
        "      t expression 5 associated with this sound at\n" +
        "      part P1, measure X8, edu 0?>\n" +
        "    ",
      attributes: { dynamics: 83 },
    },
    { tag: "sound", type: "close", endingIndex: 539 },
    { tag: "note", type: "open", endingIndex: 550 },
    { tag: "pitch", type: "open", endingIndex: 564 },
    { tag: "step", type: "open", endingIndex: 579, value: "C" },
    { tag: "step", type: "close", endingIndex: 587 },
    { tag: "octave", type: "open", endingIndex: 604, value: 4 },
    { tag: "octave", type: "close", endingIndex: 614 },
    { tag: "pitch", type: "close", endingIndex: 629 },
    { tag: "duration", type: "open", endingIndex: 646, value: 4 },
    { tag: "duration", type: "close", endingIndex: 658 },
    { tag: "voice", type: "open", endingIndex: 672, value: 1 },
    { tag: "voice", type: "close", endingIndex: 681 },
    { tag: "type", type: "open", endingIndex: 694, value: "whole" },
    { tag: "type", type: "close", endingIndex: 706 },
    { tag: "note", type: "close", endingIndex: 718 },
    { tag: "note", type: "open", endingIndex: 729 },
    { tag: "pitch", type: "open", endingIndex: 743 },
    { tag: "step", type: "open", endingIndex: 758, value: "D" },
    { tag: "step", type: "close", endingIndex: 766 },
    { tag: "octave", type: "open", endingIndex: 783, value: 5 },
    { tag: "octave", type: "close", endingIndex: 793 },
    { tag: "pitch", type: "close", endingIndex: 808 },
    { tag: "duration", type: "open", endingIndex: 825, value: 4 },
    { tag: "duration", type: "close", endingIndex: 837 },
    { tag: "voice", type: "open", endingIndex: 851, value: 1 },
    { tag: "voice", type: "close", endingIndex: 860 },
    { tag: "type", type: "open", endingIndex: 873, value: "whole" },
    { tag: "type", type: "close", endingIndex: 885 },
    { tag: "note", type: "close", endingIndex: 897 },
    { tag: "measure", type: "close", endingIndex: 910 },
    { tag: "part", type: "close", endingIndex: 918 },
  ]);
});
