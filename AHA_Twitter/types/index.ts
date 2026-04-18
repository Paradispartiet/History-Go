import type { NodeType } from '@/lib/constants/nodeTypes';
import type { PostType } from '@/lib/constants/postTypes';

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends Timestamped {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface Post extends Timestamped {
  id: string;
  authorId: string;
  postType: PostType;
  content: string;
}

export interface GraphNode {
  id: string;
  nodeType: NodeType;
  label: string;
  description: string | null;
  createdAt: string;
}

export interface PostNode {
  id: string;
  postId: string;
  nodeId: string;
  createdAt: string;
}

export interface Follow extends Timestamped {
  id: string;
  followerId: string;
  followingId: string;
}
