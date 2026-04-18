export const NODE_TYPES = ["idea", "place", "person", "topic"] as const;

export type NodeType = (typeof NODE_TYPES)[number];
