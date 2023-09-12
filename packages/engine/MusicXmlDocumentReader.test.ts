import test from "ava";
import assert from "assert";
import { readFileSync } from "fs";
import { readMusicXmlDocument } from "./MusicXmlDocumentReader.js";
import fs from "fs";

test(`readMusicXmlDocument() > `, (t) => {
  const contents = fs.readFileSync(
    "./resources/13 - Chopin Nocturne Op. 9 No. 1.musicxml",
    "utf-8"
  );
  readMusicXmlDocument(contents);
  t.fail();
});
