import type { NodeType } from "@/lib/constants/node-types";
import type { PostType } from "@/lib/constants/post-types";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  body: string;
  post_type: PostType;
  created_at: string;
  updated_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: NodeType;
  created_by: string | null;
  created_at: string;
}

export interface PostNode {
  id: string;
  post_id: string;
  node_id: string;
  created_by: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
      };
      posts: {
        Row: Post;
        Insert: Pick<Post, "author_id" | "body" | "post_type"> & Partial<Post>;
        Update: Partial<Post>;
      };
      graph_nodes: {
        Row: GraphNode;
        Insert: Pick<GraphNode, "label" | "node_type"> & Partial<GraphNode>;
        Update: Partial<GraphNode>;
      };
      post_nodes: {
        Row: PostNode;
        Insert: Pick<PostNode, "post_id" | "node_id" | "created_by"> & Partial<PostNode>;
        Update: Partial<PostNode>;
      };
      follows: {
        Row: Follow;
        Insert: Follow;
        Update: Partial<Follow>;
      };
    };
  };
}
