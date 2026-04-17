import type { NodeType } from '@/lib/constants/nodeTypes';
import type { PostType } from '@/lib/constants/postTypes';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends BaseEntity {
  nodeType: NodeType;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface FeedPost extends BaseEntity {
  nodeType: NodeType;
  postType: PostType;
  authorId: string;
  content: string;
}

export interface Edge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
}
