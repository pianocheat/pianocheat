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
  t.deepEqual(getNextXmlElement({ xml: "", startingIndex: 0 }), null);
});

test(`getNextXmlElement() > should return null for invalid XML with a space between < and the tag name`, (t) => {
  t.deepEqual(getNextXmlElement({ xml: "   < tag >", startingIndex: 0 }), null);
});

test(`getNextXmlElement() > should return tag`, (t) => {
  t.deepEqual(
    getNextXmlElement({ debug: false, xml: "   <tag >", startingIndex: 0 }),
    { tag: "tag", attributes: {} }
  );
});

test(`getNextXmlElement() > should return tag with one attribute`, (t) => {
  t.deepEqual(
    getNextXmlElement({ debug: false, xml: "<tag a='b'>", startingIndex: 0 }),
    { tag: "tag", attributes: { a: "b" } }
  );
});

test(`getNextXmlElement() > should return tag with multiple attribute with coerced number attribute values`, (t) => {
  t.deepEqual(
    getNextXmlElement({
      debug: false,
      xml: "<tag a='1' b='2' c='3'>",
      startingIndex: 0,
    }),
    { tag: "tag", attributes: { a: 1, b: 2, c: 3 } }
  );
});

test(`getNextXmlElement() > should return tag with multiple attribute with coerced number attribute values with whitespaces`, (t) => {
  t.deepEqual(
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
  t.deepEqual(
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
  t.deepEqual(
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
  t.deepEqual(
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
  t.deepEqual(
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
