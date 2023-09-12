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

export function camelize(str: string) {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}
