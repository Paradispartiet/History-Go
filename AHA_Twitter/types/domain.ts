import type { NodeType } from "@/lib/constants/node-types";
import type { PostType } from "@/lib/constants/post-types";

export interface CreatePostInput {
  body: string;
  postType: PostType;
}

export interface AttachNodeInput {
  postId: string;
  label: string;
  nodeType: NodeType;
}
