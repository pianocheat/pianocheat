import path from "path";

const Strings = {
  StartMeasureTag: "<measure",
  EndMeasureTag: "</measure",
  OpeningTag: "<",
  ClosingTag: ">",
};

export function readMusicXmlDocument(contents: string) {
  let needle = 0;

  function findNext(target: string, idx: number = needle) {
    return contents.indexOf(target, idx);
  }

  do {
    let startMeasureTagIdx = findNext(Strings.StartMeasureTag);

    if (startMeasureTagIdx === -1) {
      // "<measure" not found
      break;
    }

    let endMeasureTagIdx = contents.indexOf(
      Strings.EndMeasureTag,
      startMeasureTagIdx
    );

    if (endMeasureTagIdx === -1) {
      console.warn(
        `Found a starting '<measure' tag at index ${startMeasureTagIdx} but no closing '</measure' tag. The string searched was: '${contents.substring(
          startMeasureTagIdx
        )}'.`
      );
      break;
    }

    let endMeasureTagClosingTagIdx = contents.indexOf(
      Strings.ClosingTag,
      endMeasureTagIdx
    );

    if (endMeasureTagClosingTagIdx === -1) {
      console.warn(
        `Found a closing '</measure' tag at index ${endMeasureTagIdx} but no final tag closing '>' character. The string searched was: '${contents.substring(
          endMeasureTagIdx
        )}'.`
      );
      break;
    }

    const measureStr = contents.slice(
      startMeasureTagIdx,
      endMeasureTagClosingTagIdx + 1
    );
    readMusicXmlDocumentMeasure(measureStr);
  } while (true);
}

export function getMeasureXml(contents: string, startIndex: number) {
  let startMeasureTagIdx = contents.indexOf(
    Strings.StartMeasureTag,
    startIndex
  );

  if (startMeasureTagIdx === -1) {
    // "<measure" not found
    return {
      found: false,
      startingMatchIndex: -1,
      endingMatchIndex: -1,
      searchString: Strings.StartMeasureTag,
      text: contents.slice(startIndex),
      startingSearchIndex: startIndex,
    };
  }

  let endMeasureTagIdx = contents.indexOf(
    Strings.EndMeasureTag,
    startMeasureTagIdx
  );

  if (endMeasureTagIdx === -1) {
    console.warn(
      `Found a starting '<measure' tag at index ${startMeasureTagIdx} but no closing '</measure' tag. The string searched was: '${contents.substring(
        startMeasureTagIdx
      )}'.`
    );
    return {
      found: false,
      startingMatchIndex: -1,
      endingMatchIndex: -1,
      searchString: Strings.EndMeasureTag,
      text: contents.slice(startMeasureTagIdx),
      startingSearchIndex: startMeasureTagIdx,
    };
  }

  let endMeasureTagClosingTagIdx = contents.indexOf(
    Strings.ClosingTag,
    endMeasureTagIdx
  );

  if (endMeasureTagClosingTagIdx === -1) {
    console.warn(
      `Found a closing '</measure' tag at index ${endMeasureTagIdx} but no final tag closing '>' character. The string searched was: '${contents.substring(
        endMeasureTagIdx
      )}'.`
    );
    return {
      found: false,
      startingMatchIndex: -1,
      endingMatchIndex: -1,
      searchString: Strings.ClosingTag,
      text: contents.slice(endMeasureTagIdx),
      startingSearchIndex: endMeasureTagIdx,
    };
  }

  const measureStr = contents.slice(
    startMeasureTagIdx,
    endMeasureTagClosingTagIdx + 1
  );

  return {
    found: true,
    text: measureStr,
    startingMatchIndex: startMeasureTagIdx,
    endingMatchIndex: endMeasureTagClosingTagIdx + 1,
    searchString: "<measure .* > .* </measure .* >",
    startingSearchIndex: startIndex,
  };
}

function readMusicXmlDocumentMeasure(contents: string) {}
