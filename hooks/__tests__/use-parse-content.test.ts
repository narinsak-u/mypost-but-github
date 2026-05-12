import { describe, it, expect } from "vitest";
import { useParseContent } from "../use-parse-content";

describe("useParseContent", () => {
  it("returns empty string for empty input", () => {
    expect(useParseContent("")).toBe("");
    expect(useParseContent(null as unknown as string)).toBe("");
    expect(useParseContent(undefined as unknown as string)).toBe("");
  });

  it("parses HTML content", () => {
    const html = "<p>Hello <strong>World</strong></p>";
    const result = useParseContent(html);
    expect(result).toContain("Hello");
    expect(result).toContain("<strong>World</strong>");
  });

  it("returns plain text unchanged", () => {
    const text = "Hello World";
    expect(useParseContent(text)).toBe(text);
  });
});
