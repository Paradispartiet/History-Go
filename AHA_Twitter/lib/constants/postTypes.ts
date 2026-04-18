export const POST_TYPES = {
  THOUGHT: 'thought',
  INSIGHT: 'insight',
  QUESTION: 'question'
} as const;

export type PostType = (typeof POST_TYPES)[keyof typeof POST_TYPES];

export const POST_TYPE_OPTIONS = Object.values(POST_TYPES);
