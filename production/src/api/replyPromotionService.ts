import { Post, PostReply, User } from '../types';
import apiClient from './apiClient';
import { RawComment, RawUser } from './transformService';
import { transformDiscussionTree, RawDiscussionTree } from './discussionTreeTransform';

/**
 * Promeut une reply en post et ajoute une nouvelle reply à ce post.
 * Route: POST /api/posts/<post_key>/comments/<comment_id>/promote
 */
export async function promoteReplyToPostOnApi(
  postId: string, 
  replyId: string, 
  newReplyContent: string,
  newReplyAuthorId: string
): Promise<{ newPostId: string; newReplyId: string; newPost: Post } | null> {
  try {
    const postKey = postId.split('/')[1];
    const payload = { 
      newReplyContent,
      newReplyAuthorId
    };
    
    const response = await apiClient.post<{
      newPost: any;
      newReply: RawComment;
      user: RawUser;
    }>(`/posts/${postKey}/comments/${replyId}/promote`, payload);
    
    console.log('✅ Reply promue en post:', response.data);
    
    return {
      newPostId: response.data.newPost.id || `posts/${response.data.newPost._id}`,
      newReplyId: response.data.newReply.id,
      newPost: response.data.newPost
    };
  } catch (error) {
    console.error(`❌ Error promoting reply ${replyId} to post:`, error);
    return null;
  }
}

/**
 * Récupère l'arbre de discussion complet d'un post.
 * Route: GET /api/posts/<post_key>/discussion-tree
 * Retour: { main_post, derived_posts, users }
 */
export async function getDiscussionTreeOnApi(postId: string): Promise<{
  mainPost: Post;
  derivedPosts: Post[];
  usersMap: Map<string, User>;
} | null> {
  try {
    const postKey = postId.split('/')[1];
    const response = await apiClient.get<RawDiscussionTree>(`/posts/${postKey}/discussion-tree`);
    
    console.log('✅ Discussion tree récupérée');
    
    // Transformer les données brutes
    return transformDiscussionTree(response.data);
  } catch (error) {
    console.error(`❌ Error fetching discussion tree:`, error);
    return null;
  }
}
