"use server";

import { db as prisma } from "@/lib/prismadb";

type PostSearchResult = {
    id: string;
    title: string;
    body: string | null;
    score?: number;
    highlights?: {
        path: string;
        texts: { value: string; type: "text" | "hit" }[];
    }[];
};

// Normalize MongoDB ObjectId to string
// This is necessary because MongoDB ObjectIds are not strings by default
// and can cause issues when serializing to JSON
const normalizeMongoId = (value: unknown) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";

    // safely check properties without TypeScript complaining.
    // Some MongoDB serializers represent ObjectId like { $oid: "..." }.
    // If that exists, extract the real string id.
    const asAny = value as any;
    if (typeof asAny.$oid === "string") return asAny.$oid;
    if (typeof asAny.toString === "function") return String(asAny.toString());
    return "";
};

export async function searchPostsAutocomplete(query: string): Promise<PostSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
        const result = await prisma.$runCommandRaw({
            aggregate: "Post",
            pipeline: [
                {
                    $search: {
                        index: "default",
                        autocomplete: {
                            query: trimmed,
                            path: "title",
                            fuzzy: {
                                maxEdits: 1,
                            },
                        },
                        highlight: {
                            path: ["title", "body"],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        body: 1,
                        highlights: { $meta: "searchHighlights" },
                        score: { $meta: "searchScore" },
                    },
                },
                { $limit: 8 },
            ],
            cursor: {},
        });

        const raw = result as { cursor?: { firstBatch?: any[] } };
        const docs = raw?.cursor?.firstBatch ?? [];

        return docs
            .map((doc) => ({
                id: normalizeMongoId(doc?._id),
                title: String(doc?.title ?? ""),
                body: typeof doc?.body === "string" ? doc.body : null,
                score: typeof doc?.score === "number" ? doc.score : undefined,
                highlights: doc?.highlights ?? [],
            }))
            .filter((d) => Boolean(d.id) && Boolean(d.title));
    } catch (e) {
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: trimmed, mode: "insensitive" } },
                    { body: { contains: trimmed, mode: "insensitive" } },
                ],
            },
            select: { id: true, title: true, body: true },
            take: 8,
            orderBy: { createdAt: "desc" },
        });

        return posts.map((p) => ({
            id: p.id,
            title: p.title,
            body: p.body,
        }));
    }
}
