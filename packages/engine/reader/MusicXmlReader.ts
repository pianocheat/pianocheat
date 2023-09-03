import nativeFs from "fs";
import { fs as memFs } from "memfs";
import { parse as parseXmlString } from "txml/dist/txml.js";
import camelCaseKeys from "camelcase-keys";
import path from "path";

export type RawScoreObjectNode = {
  tagName: string;
  attributes: any;
  children: Array<RawScoreObjectNode | string | number>;
};

export type RawScoreNode = string | RawScoreObjectNode;

export type RawScore = Array<RawScoreNode>;

const VALID_MUSICXML_EXTS = [".xml", ".musicxml"];

function isEmptyValue(x: unknown) {
  return x === "" || x == null;
}

function parseRawScoreNodeString(nodeValue: string) {
  if (nodeValue.length === 0) {
    return null;
  } else if (["yes", "true"].includes(nodeValue.toLowerCase())) {
    return true;
  } else if (["no", "false"].includes(nodeValue.toLowerCase())) {
    return false;
  } else if (+nodeValue === +nodeValue) {
    return parseFloat(nodeValue);
  } else {
    return nodeValue;
  }
}

function parseRawScoreNode(node: RawScoreNode): RawScoreNode {
  if (typeof node === "string") {
    return node;
  }

  const { tagName, attributes, children } = node;

  const _attributes: Record<string, any> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string") {
      const result = parseRawScoreNodeString(value);
      if (!isEmptyValue(result)) {
        _attributes[key] = result;
      }
    } else if (typeof value === "number") {
      _attributes[key] = value;
    }
  }

  const _children = [];
  for (const child of children) {
    if (typeof child === "string") {
      const result = parseRawScoreNodeString(child);
      if (!isEmptyValue(result)) {
        _children.push(result);
      }
    } else if (typeof child === "number") {
      _children.push(child);
    } else if (Array.isArray(children)) {
      // A recursive RawScoreNode
      _children.push(parseRawScoreNode(child));
    }
  }

  const result = {
    tagName,
    attributes: _attributes,
    children: _children,
  };

  return result as RawScoreNode;
}

function parseMusicXml(fileContents: string): RawScore {
  try {
    const fileContentsWithoutProcessingInstructionTags = fileContents.replace(
      /<\?([\s\S]*?)\?>/g,
      ""
    );

    const xmlNodes = parseXmlString(
      fileContentsWithoutProcessingInstructionTags
    );
    const modeledXmlNodes = xmlNodes.map(parseRawScoreNode);
    return camelCaseKeys(modeledXmlNodes, { deep: true });
  } catch (e) {
    throw new Error(`Unable to parse MusicXML file. ${String(e)}`);
  }
}

export default class MusicXmlReader {
  private scorePartWise: any;

  readFile(
    filePath: string,
    { fs }: { fs: typeof nativeFs | typeof memFs } = { fs: nativeFs }
  ): RawScore | null {
    if (!this.isValidFileExtension(filePath)) {
      throw new Error(
        `Expected ${filePath} to have a valid MusicXML file extension of ${VALID_MUSICXML_EXTS.join(
          " or "
        )}.`
      );
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist at ${filePath}.`);
    }

    const fileContents = fs.readFileSync(filePath, "utf8") as string;

    const parsedMusicXml = parseMusicXml(fileContents);

    for (const entry of Object.values(parsedMusicXml)) {
      if (typeof entry !== "object") {
        continue;
      }

      const { tagName, children } = entry;
      if (tagName === "score-partwise") {
        this.scorePartWise = children;
        break;
      }
    }

    if (!this.scorePartWise) {
      throw new Error(
        `This is not a valid MusicXML file. No top-level <score-partwise> XML element was found.`
      );
    }

    return this.scorePartWise;
  }

  isValidFileExtension(filePath: string) {
    return VALID_MUSICXML_EXTS.includes(path.extname(filePath));
  }
}
