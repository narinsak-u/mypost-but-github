export const useParseContent = (body: string) => {
  if (!body) return "";
  if (typeof DOMParser === "undefined") return body;

  const parser = new DOMParser();
  const document = parser.parseFromString(body, "text/html");
  return document?.body?.innerHTML ?? body;
};
