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

export function camelize(text: string) {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+|-/g, "");
}
