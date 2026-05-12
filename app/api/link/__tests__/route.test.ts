import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

vi.mock("axios");

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown) => new Response(JSON.stringify(data)),
    error: (message: string) => new Response(message, { status: 500 }),
  },
}));

describe("link API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("URL validation", () => {
    it("rejects URLs with non-HTTP protocols", async () => {
      const { GET } = await import("../route");
      const testCases = [
        "ftp://example.com/file",
        "file:///etc/passwd",
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
      ];

      for (const url of testCases) {
        const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent(url)}`);
        const response = await GET(req);
        expect(response.status).toBe(400);
        const text = await response.text();
        expect(text).toContain("protocol");
      }
    });

    it("rejects localhost URLs", async () => {
      const { GET } = await import("../route");
      const testCases = [
        "http://localhost",
        "http://localhost:3000",
        "https://localhost/admin",
        "http://127.0.0.1",
        "http://127.0.0.1:8080/api",
      ];

      for (const url of testCases) {
        const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent(url)}`);
        const response = await GET(req);
        expect(response.status).toBe(400);
        const text = await response.text();
        expect(text).toContain("localhost");
      }
    });

    it("rejects private IP addresses", async () => {
      const { GET } = await import("../route");
      const testCases = [
        "http://10.0.0.1",
        "http://10.255.255.255/admin",
        "http://172.16.0.1",
        "http://172.31.255.255",
        "http://192.168.0.1",
        "http://192.168.255.255/admin",
      ];

      for (const url of testCases) {
        const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent(url)}`);
        const response = await GET(req);
        expect(response.status).toBe(400);
        const text = await response.text();
        expect(text).toContain("private");
      }
    });

    it("rejects cloud metadata endpoints", async () => {
      const { GET } = await import("../route");
      const testCases = [
        "http://169.254.169.254/latest/meta-data",
        "http://169.254.169.254/computeMetadata/v1",
        "http://0.0.0.0/admin",
      ];

      for (const url of testCases) {
        const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent(url)}`);
        const response = await GET(req);
        expect(response.status).toBe(400);
        const text = await response.text();
        expect(text).toContain("cloud metadata");
      }
    });

    it("rejects invalid URLs", async () => {
      const { GET } = await import("../route");
      const testCases = [
        "not-a-url",
        "",
      ];

      for (const url of testCases) {
        const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent(url)}`);
        const response = await GET(req);
        expect(response.status).toBe(400);
      }
    });

    it("accepts valid HTTP URLs", async () => {
      const { GET } = await import("../route");
      const mockHtml = `
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
            <meta property="og:image" content="https://example.com/image.jpg">
          </head>
          <body></body>
        </html>
      `;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://example.com")}`);
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: 1,
        meta: {
          title: "Test Page",
          description: "Test description",
          image: {
            url: "https://example.com/image.jpg",
          },
        },
      });
      expect(axios.get).toHaveBeenCalledWith("https://example.com");
    });

    it("accepts valid HTTPS URLs", async () => {
      const { GET } = await import("../route");
      const mockHtml = `<html><title>Secure Page</title></html>`;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://secure.example.com/page")}`);
      const response = await GET(req);

      expect(response.status).toBe(200);
    });
  });

  describe("metadata parsing", () => {
    it("handles missing metadata gracefully", async () => {
      const { GET } = await import("../route");
      const mockHtml = `<html><body>No metadata</body></html>`;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://example.com")}`);
      const response = await GET(req);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: 1,
        meta: {
          title: "",
          description: "",
          image: {
            url: "",
          },
        },
      });
    });

    it("extracts title from HTML", async () => {
      const { GET } = await import("../route");
      const mockHtml = `<html><head><title>My Page Title</title></head><body></body></html>`;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://example.com")}`);
      const response = await GET(req);

      const data = await response.json();
      expect(data.meta.title).toBe("My Page Title");
    });

    it("extracts description from meta tag", async () => {
      const { GET } = await import("../route");
      const mockHtml = `<html><head><meta name="description" content="Page description here"></head></html>`;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://example.com")}`);
      const response = await GET(req);

      const data = await response.json();
      expect(data.meta.description).toBe("Page description here");
    });

    it("extracts og:image from meta tag", async () => {
      const { GET } = await import("../route");
      const mockHtml = `<html><head><meta property="og:image" content="https://cdn.example.com/img.jpg"></head></html>`;

      vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://example.com")}`);
      const response = await GET(req);

      const data = await response.json();
      expect(data.meta.image.url).toBe("https://cdn.example.com/img.jpg");
    });
  });

  describe("error handling", () => {
    it("returns 400 when URL parameter is missing", async () => {
      const { GET } = await import("../route");
      const req = new Request("http://localhost:3000/api/link");
      const response = await GET(req);
      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe("Invalid href");
    });

    it("returns 400 when URL parameter is empty", async () => {
      const { GET } = await import("../route");
      const req = new Request("http://localhost:3000/api/link?url=");
      const response = await GET(req);
      expect(response.status).toBe(400);
    });

    it("handles axios errors", async () => {
      const { GET } = await import("../route");
      vi.mocked(axios.get).mockRejectedValue(new Error("Network error"));

      const req = new Request(`http://localhost:3000/api/link?url=${encodeURIComponent("https://example.com")}`);
      await expect(GET(req)).rejects.toThrow();
    });
  });
});
