import test from "ava";
import { withNormalizedWhitespace } from "./Utils.js";

test(`withNormalizedWhitespace() > returns equal text for one word`, (t) => {
  t.deepEqual(withNormalizedWhitespace("text"), "text");
});

test(`withNormalizedWhitespace() > converts two or more spaces to one space`, (t) => {
  t.deepEqual(withNormalizedWhitespace("a b"), "a b");
  t.deepEqual(withNormalizedWhitespace("a  b"), "a b");
  t.deepEqual(withNormalizedWhitespace("a   b"), "a b");
});

test(`withNormalizedWhitespace() > removes line breaks`, (t) => {
  t.deepEqual(
    withNormalizedWhitespace(`a
  b`),
    "a b"
  );
  t.deepEqual(
    withNormalizedWhitespace(`a

  b`),
    "a b"
  );
});

test(`withNormalizedWhitespace() > trims starting and ending spaces`, (t) => {
  t.deepEqual(withNormalizedWhitespace(` a b `), "a b");
});
