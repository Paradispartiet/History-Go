export const NODE_TYPES = {
  IDEA: 'idea',
  PLACE: 'place',
  PERSON: 'person',
  TOPIC: 'topic'
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export const NODE_TYPE_OPTIONS = Object.values(NODE_TYPES);
