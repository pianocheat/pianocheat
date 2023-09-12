import test from "ava";
import assert from "assert";
import { getNextXmlElement } from "./XmlDocumentReader.js";

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
  </measure>
</part>`;

test(`getNextXmlElement() > should return null for an empty string`, (t) => {
  t.is(getNextXmlElement({ xml: "", startingIndex: 0 }), null);
});

test(`getNextXmlElement() > should return null for invalid XML with a space between < and the tag name`, (t) => {
  t.is(getNextXmlElement({ xml: "   < tag >", startingIndex: 0 }), null);
});

test(`getNextXmlElement() > should return tag`, (t) => {
  t.like(
    getNextXmlElement({ debug: false, xml: "   <tag >", startingIndex: 0 }),
    { tag: "tag", attributes: {} }
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
    { tag: "tag", attributes: {} }
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
    { tag: "tag", attributes: {} }
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
    { tag: "tag", attributes: {}, value: 123 }
  );
});

test(`getNextXmlElement() > should get child values with spaces`, (t) => {
  t.like(
    getNextXmlElement({
      debug: false,
      xml: `<tag>  123 a</tag>`,
      startingIndex: 0,
    }),
    { tag: "tag", attributes: {}, value: "  123 a" }
  );
});

test(`getNextXmlElement() > should parse XML document elements with their attributes`, (t) => {
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
    elements.push({
      tag: element.tag,
      attributes: element.attributes,
      value: element.value,
    });
    needle = element.endingIndex;
  }

  t.like(elements, [
    { tag: "part", attributes: { id: "P1" }, value: null },
    { tag: "measure", attributes: { number: 1 }, value: null },
    { tag: "barline", attributes: { location: "left" }, value: null },
    { tag: "bar", attributes: {}, value: null },
    { tag: "repeat", attributes: { direction: "forward" }, value: null },
    { tag: "attributes", attributes: {}, value: null },
    { tag: "divisions", attributes: {}, value: 1 },
    { tag: "key", attributes: {}, value: null },
    { tag: "fifths", attributes: {}, value: 0 },
    { tag: "clef", attributes: {}, value: null },
    { tag: "sign", attributes: {}, value: "G" },
    { tag: "line", attributes: {}, value: 2 },
    {
      tag: "sound",
      attributes: { dynamics: 83 },
      value:
        "\n" +
        "      <?DoletFinale Unknown text expression 5 associated with t\n" +
        "      t expression 5 associated with this sound at\n" +
        "      part P1, measure X8, edu 0?>\n" +
        "    ",
    },
    { tag: "note", attributes: {}, value: null },
    { tag: "pitch", attributes: {}, value: null },
    { tag: "step", attributes: {}, value: "C" },
    { tag: "octave", attributes: {}, value: 4 },
    { tag: "duration", attributes: {}, value: 4 },
    { tag: "voice", attributes: {}, value: 1 },
    { tag: "type", attributes: {}, value: "whole" },
    { tag: "note", attributes: {}, value: null },
    { tag: "pitch", attributes: {}, value: null },
    { tag: "step", attributes: {}, value: "D" },
    { tag: "octave", attributes: {}, value: 5 },
    { tag: "duration", attributes: {}, value: 4 },
    { tag: "voice", attributes: {}, value: 1 },
    { tag: "type", attributes: {}, value: "whole" },
  ]);
});
