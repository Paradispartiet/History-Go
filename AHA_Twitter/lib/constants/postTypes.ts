export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  LINK: 'link',
  REPOST: 'repost'
} as const;

export type PostType = (typeof POST_TYPES)[keyof typeof POST_TYPES];
