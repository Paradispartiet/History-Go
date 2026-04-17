export const NODE_TYPES = {
  USER: 'user',
  POST: 'post',
  TOPIC: 'topic'
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];
