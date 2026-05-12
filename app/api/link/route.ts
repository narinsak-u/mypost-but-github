import axios from "axios";

function validateUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" };
    }

    const hostname = url.hostname.toLowerCase();

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return { valid: false, error: "Access to localhost is not allowed" };
    }

    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
      return { valid: false, error: "Access to private IP addresses is not allowed" };
    }

    if (/^(0\.0\.0\.0|169\.254\.169\.254)$/.test(hostname)) {
      return { valid: false, error: "Access to cloud metadata endpoints is not allowed" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid URL format" };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const href = url.searchParams.get("url");

  if (!href) {
    return new Response("Invalid href", { status: 400 });
  }

  const validation = validateUrl(href);
  if (!validation.valid) {
    return new Response(validation.error, { status: 400 });
  }

  const res = await axios.get(href);

  // Parse the HTML using regular expressions
  const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";

  const descriptionMatch = res.data.match(
    /<meta name="description" content="(.*?)"/
  );
  const description = descriptionMatch ? descriptionMatch[1] : "";

  const imageMatch = res.data.match(
    /<meta property="og:image" content="(.*?)"/
  );
  const imageUrl = imageMatch ? imageMatch[1] : "";

  // Return the data in the format required by the editor tool
  return new Response(
    JSON.stringify({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl,
        },
      },
    })
  );
}
