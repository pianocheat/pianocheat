interface GetNextXmlElementParams {
  /**
   * The XML document string to search in. The starting search index can be specified by the `startingIndex` parameter.
   */
  xml: string;

  /**
   * Specifies the starting search position for finding the next available XML element.
   */
  startingIndex: number;

  /**
   * Prints console logs while tracing out the XML.
   */
  debug?: boolean;
}

type XmlDocumentElementAttributeValue = number | string;

interface XmlDocumentElement {
  /**
   * The tag name of the XML element. For example, "measure" or "pitch".
   */
  tag: string;

  /**
   * The key-value attribute pairs for the XMl element.
   */
  attributes: Record<string, XmlDocumentElementAttributeValue>;
}

const CharCodeLeftArrow = "<".charCodeAt(0);
const CharCodeRightArrow = ">".charCodeAt(0);
const CharCodeForwardSlash = "/".charCodeAt(0);
const CharCodeExclamation = "!".charCodeAt(0);
const CharCodeSingleQuote = "'".charCodeAt(0);
const CharCodeDoubleQuote = '"'.charCodeAt(0);
const CharCodeEquals = "=".charCodeAt(0);
const CharCodeSpace = " ".charCodeAt(0);
const CharCodeLineBreak = 10;

export function isCharCodeLetter(charCode: number) {
  return (
    (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)
  );
}

export function indexOfNextNonSelfClosingTag(
  text: string,
  startingIndex: number,
  endingIndex: number
) {
  for (let needle = startingIndex; needle < endingIndex; needle++) {
    let charCode = text.charCodeAt(needle);

    if (charCode !== CharCodeLeftArrow) {
      continue;
    } // We've found our '<' open tag

    const nextCharCode = text.charCodeAt(needle + 1);
    const isForwardSlash = nextCharCode === CharCodeForwardSlash;

    if (isForwardSlash) {
      return needle;
    }
  }

  return -1;
}

export function indexOfNextOpenTag(text: string, startingIndex: number) {
  for (let needle = startingIndex; needle < text.length; needle++) {
    let charCode = text.charCodeAt(needle);

    if (charCode !== CharCodeLeftArrow) {
      continue;
    } // We've found our '<' open tag

    const nextCharCode = text.charCodeAt(needle + 1);
    const isOpenTag = isCharCodeLetter(nextCharCode);

    if (isOpenTag) {
      return needle;
    }
  }

  return -1;
}

export function skipWhiteSpaceCharacters(text: string, startingIndex: number) {
  let needle = startingIndex;

  for (; needle < text.length; needle++) {
    let charCode = text.charCodeAt(needle);

    if (charCode === CharCodeSpace || charCode === CharCodeLineBreak) {
      continue;
    }

    break;
  }

  return needle;
}

export function readUntilSingleOrDoubleQuote(
  text: string,
  startingIndex: number
) {
  let needle = startingIndex;

  for (; needle < text.length; needle++) {
    let charCode = text.charCodeAt(needle);

    if (charCode !== CharCodeSingleQuote && charCode !== CharCodeDoubleQuote) {
      continue;
    }

    break;
  }

  return needle;
}

export function readNextLetters(text: string, startingIndex: number) {
  for (let needle = startingIndex; needle < text.length; needle++) {
    let charCode = text.charCodeAt(needle);

    if (!isCharCodeLetter(charCode)) {
      return {
        startingIndex,
        endingIndex: needle,
        letters: text.slice(startingIndex, needle),
      };
    }
  }

  return {
    startingIndex,
    endingIndex: text.length,
    letters: text.slice(startingIndex),
  };
}

export function getNextXmlElement({
  xml,
  startingIndex,
  debug,
}: GetNextXmlElementParams): null | {
  tag: string;
  value: null | XmlDocumentElementAttributeValue;
  attributes: Record<string, XmlDocumentElementAttributeValue>;
  endingIndex: number;
} {
  if (debug) {
    console.log(
      `[getNextXmlElement()] 1. Debugging XML of length ${
        xml.length
      } starting at index ${startingIndex}: '${xml.slice(startingIndex)}'.`
    );
  }

  let postWhiteSpaceIdx = skipWhiteSpaceCharacters(xml, startingIndex);

  if (debug) {
    console.log(
      `[getNextXmlElement()] 2. Skipping ${
        postWhiteSpaceIdx - startingIndex
      } whitespace characters. XML is now '${xml.slice(postWhiteSpaceIdx)}'.`
    );
  }

  const nextOpenTagIdx = indexOfNextOpenTag(xml, postWhiteSpaceIdx);
  if (debug) {
    console.log(
      `[getNextXmlElement()] 3. ${
        nextOpenTagIdx - postWhiteSpaceIdx
      } characters later, found the next open tag index at ${nextOpenTagIdx}. XML is now '${xml.slice(
        nextOpenTagIdx
      )}'.`
    );
  }

  const { endingIndex: tagNameEndingIndex, letters: tagName } = readNextLetters(
    xml,
    nextOpenTagIdx + 1 // Skip the actual '<' open tag character
  );

  if (debug) {
    console.log(`[getNextXmlElement()] 4. Read tag name '${tagName}'.`);
  }

  const postTagNameAndWhiteSpaceIndex = skipWhiteSpaceCharacters(
    xml,
    tagNameEndingIndex
  );

  const attributes: Record<string, XmlDocumentElementAttributeValue> = {};

  let needle = postTagNameAndWhiteSpaceIndex;
  while (isCharCodeLetter(xml.charCodeAt(needle))) {
    const { endingIndex: attributeNameEndingIndex, letters: attributeName } =
      readNextLetters(xml, needle);
    const afterAttributeNameEndingWhiteSpaceIdx = skipWhiteSpaceCharacters(
      xml,
      attributeNameEndingIndex
    );

    if (debug) {
      console.log(
        `[getNextXmlElement()] 5. Read attribute name '${attributeName}'.`
      );
    }

    if (
      xml.charCodeAt(afterAttributeNameEndingWhiteSpaceIdx) !== CharCodeEquals
    ) {
      throw new Error(
        `Expected equals sign after attribute name. XML excerpt is: ${xml.substring(
          needle,
          150
        )}`
      );
    }

    const afterAttributeEqualsSignIdx = skipWhiteSpaceCharacters(
      xml,
      afterAttributeNameEndingWhiteSpaceIdx + 1 // + 1 here to skip the last white space
    );

    if (
      xml.charCodeAt(afterAttributeEqualsSignIdx) !== CharCodeSingleQuote &&
      xml.charCodeAt(afterAttributeEqualsSignIdx) !== CharCodeDoubleQuote
    ) {
      throw new Error(
        `Expected single ' or double quote " after attribute equals sign, but found ${xml.charAt(
          afterAttributeEqualsSignIdx
        )}. XML excerpt is: ${xml.substring(
          afterAttributeEqualsSignIdx - 1,
          150
        )}`
      );
    }

    const afterOpenQuoteIdx = afterAttributeEqualsSignIdx + 1; // + 1 to skip opening quote
    const endQuoteIdx = readUntilSingleOrDoubleQuote(xml, afterOpenQuoteIdx);
    const attributeValue = xml.slice(afterOpenQuoteIdx, endQuoteIdx);
    const attributeValueAsNumber = Number(attributeValue);
    attributes[attributeName] = Number.isNaN(attributeValueAsNumber)
      ? attributeValue
      : attributeValueAsNumber;

    if (debug) {
      console.log(
        `[getNextXmlElement()] 5.5 ${JSON.stringify(
          {
            xml,
            afterOpenQuoteIdx,
            endQuoteIdx,
          },
          null,
          4
        )}`
      );
      console.log(
        `[getNextXmlElement()] 6. Read attribute value \`${attributeValue}\``
      );
    }

    const afterAttributeValueIdx = skipWhiteSpaceCharacters(
      xml,
      endQuoteIdx + 1 // after the end quote
    );
    needle = afterAttributeValueIdx; // Update the needle to after reading this latest attribute value

    if (debug) {
      console.log(
        `[getNextXmlElement()] 7. Post-attribute value reading, XMl string is now ${xml.slice(
          needle
        )}`
      );
    }

    // Found />
    const isSelfClosingXmlElement =
      xml.charCodeAt(needle) === CharCodeForwardSlash &&
      xml.charCodeAt(needle + 1) === CharCodeRightArrow;
    // Found >
    const isNonSelfClosingXmlElement =
      xml.charCodeAt(needle) === CharCodeRightArrow;
    if (isSelfClosingXmlElement || isNonSelfClosingXmlElement) {
      break;
    }
  }

  const isNonSelfClosingXmlElement =
    xml.charCodeAt(needle) === CharCodeRightArrow;
  let value = null;
  if (isNonSelfClosingXmlElement) {
    // Get the child value

    // But only if this tag has a simple/short child value and not nested XML elements

    const beginningOfChildValueIdx = needle + 1;

    const _nextOpenTagIdx = indexOfNextOpenTag(xml, beginningOfChildValueIdx);
    const _nextNonSelfClosingTagIdx = indexOfNextNonSelfClosingTag(
      xml,
      beginningOfChildValueIdx,
      _nextOpenTagIdx === -1 ? xml.length : _nextOpenTagIdx + 1 // limit search to at most the next <tag otherwise our search will be inefficient and scan the whole document many times
    );

    const hasComplexNestedXmlElementsForChildren =
      _nextNonSelfClosingTagIdx === -1 ||
      (_nextOpenTagIdx !== -1 && _nextNonSelfClosingTagIdx > _nextOpenTagIdx);

    if (debug) {
      console.log(
        `[getNextXmlElement()] 8. hasComplexNestedXmlElementsForChildren block: ${JSON.stringify(
          {
            xml,
            _nextOpenTagIdx,
            _nextNonSelfClosingTagIdx,
            hasComplexNestedXmlElementsForChildren,
          },
          null,
          4
        )}`
      );
    }

    if (!hasComplexNestedXmlElementsForChildren) {
      const endOfChildValueIdx = indexOfNextNonSelfClosingTag(
        xml,
        beginningOfChildValueIdx,
        xml.length
      );
      const valueAsString = xml.slice(
        beginningOfChildValueIdx,
        endOfChildValueIdx
      );
      const valueAsNumber = Number(valueAsString);
      value = Number.isNaN(valueAsNumber) ? valueAsString : valueAsNumber;
    }
  }

  if (!tagName.length) {
    return null;
  }

  return {
    tag: tagName,
    value,
    attributes,
    endingIndex: needle,
  };
}
