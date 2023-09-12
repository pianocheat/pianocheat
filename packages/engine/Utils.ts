export function withNormalizedWhitespace(text: string) {
  return text
    .replace(/\r|\n/g, "")
    .replace(/ +/g, " ")
    .replace(/\> +\</g, "><")
    .trim();
}

export function upperCaseFirstLetter(text: string) {
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}
