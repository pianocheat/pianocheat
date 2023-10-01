import { createTheme, MantineColorsTuple, rem } from "@mantine/core";

const myColor: MantineColorsTuple = [
  "#eefcf5",
  "#dcf7ea",
  "#b4eed2",
  "#88e5b7",
  "#66dea1",
  "#52d994",
  "#46d78c",
  "#38bf79",
  "#2da96a",
  "#1b9359",
];

// Note: A beautiful color palette
// ["3b5496","4c86bf","1f2375","294582","96c4e0"]

export const theme = createTheme({
  colors: {
    myColor,
  },
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
  headings: {
    fontWeight: "700",
    fontFamily:
      "Rubik, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
    sizes: {
      h1: { fontWeight: "700", fontSize: rem(30), lineHeight: "1.4" },
    },
  },
});
