export const POST_TYPES = ["thought", "insight", "question"] as const;

export type PostType = (typeof POST_TYPES)[number];
