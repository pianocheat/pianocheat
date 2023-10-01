import test from "ava";
import { readMusicXmlDocument } from "./DraftScoreBuilder.js";
import fs from "fs";

test(`readMusicXmlDocument() > `, (t) => {
  const contents = fs.readFileSync(
    "./resources/14 - Complex Chords And Ties.musicxml",
    "utf-8"
  );
  const scoreEvents = readMusicXmlDocument(contents);
  console.log("Score Events:", scoreEvents);
  t.like(scoreEvents, []);
});
