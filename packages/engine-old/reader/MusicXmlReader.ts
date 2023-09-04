import nativeFs from "fs";
import { fs as memFs } from "memfs";
import { parse as parseXmlString } from "txml/dist/txml.js";
import camelCaseKeys from "camelcase-keys";
import path from "path";

export type XmlDocumentNode = {
  tagName: string;
  attributes: any;
  children: Array<XmlDocumentNode | string | number>;
};

export type XmlDocument = Array<XmlDocumentNode>;

const VALID_MUSIC_XML_FILE_EXTENSIONS = [".xml", ".musicxml"];

function parseStringFromNodeChildOrAttributeValue(contents: string) {
  const lowerCasedContents = contents.toLowerCase();

  if (lowerCasedContents === "yes" || lowerCasedContents === "true") {
    return true;
  } else if (lowerCasedContents === "no" || lowerCasedContents === "false") {
    return false;
  } else if (contents.length < 50 && +contents === +contents) {
    return parseFloat(contents);
  } else {
    return contents;
  }
}

function parseXmlNode(node: XmlDocumentNode): XmlDocumentNode {
  const { tagName, attributes, children } = node;

  const _attributes: Record<string, any> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string" && value.length > 0) {
      _attributes[key] = parseStringFromNodeChildOrAttributeValue(value);
    } else if (typeof value === "number") {
      _attributes[key] = value;
    } else {
      throw new Error(
        `Expected attribute value for key '${key}' to be of type string or number, instead got type '${typeof value}' with contents '${value}'.`
      );
    }
  }

  const _children = [];

  const allChildrenTagNames = new Set(
    children
      .map((child) => Object.keys((child as any)?.tagName))
      .filter((x) => x)
  );

  for (const child of children) {
    const hasNoAttributes =
      Object.keys((child as any)?.["attributes"]).length === 0;
    const childsChildren = (child as any)?.["children"];
    const hasOneScalarValueChild =
      typeof childsChildren?.[0] === "string" ||
      typeof childsChildren?.[0] === "number";
    const isTagNameUnique =
      allChildrenTagNames.has((child as any)?.tagName) && !_attributes[tagName];

    /*
        "children": [{
          "tagName": "fifths",
          "attributes": {},
          "children": [
            "0"  <------------
          ]
        }
      */
    if (isTagNameUnique && hasNoAttributes && hasOneScalarValueChild) {
      _attributes[tagName] = parseStringFromNodeChildOrAttributeValue(
        childsChildren[0]
      );
      continue;
    }

    for (const recursiveNode of childsChildren) {
      _children.push(parseXmlNode(recursiveNode));
    }
  }

  const result = {
    tagName,
    attributes: _attributes,
    children: _children,
  };

  return result as XmlDocumentNode;
}

function parseMusicXml(fileContents: string): XmlDocument {
  try {
    const fileContentsWithoutProcessingInstructionTags = fileContents.replace(
      /(<\?([\s\S]*?)\?>)|(<!([\s\S]*?)>)/g,
      ""
    );

    const xmlNodes = parseXmlString(
      fileContentsWithoutProcessingInstructionTags
    );
    // console.log(JSON.stringify(xmlNodes, null, 4));
    const modeledXmlNodesWithoutStrings = [];
    for (const xmlNode of xmlNodes) {
      if (typeof xmlNode === "string") {
        console.warn(
          "[MusicXmlReader] WARNING: Not processing XML node which is entirely a string:",
          xmlNode
        );
        continue;
      }

      modeledXmlNodesWithoutStrings.push(parseXmlNode(xmlNode));
    }
    return camelCaseKeys(modeledXmlNodesWithoutStrings, { deep: true });
  } catch (e) {
    throw new Error(`Unable to parse MusicXML file. ${String(e)}`);
  }
}

export default class MusicXmlReader {
  private scorePartWise: any;

  readFile(
    filePath: string,
    { fs }: { fs: typeof nativeFs | typeof memFs } = { fs: nativeFs }
  ): XmlDocument | null {
    if (!this.isValidFileExtension(filePath)) {
      throw new Error(
        `Expected ${filePath} to have a valid MusicXML file extension of ${VALID_MUSIC_XML_FILE_EXTENSIONS.join(
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
    return VALID_MUSIC_XML_FILE_EXTENSIONS.includes(path.extname(filePath));
  }
}
