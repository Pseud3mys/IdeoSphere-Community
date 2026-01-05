import { Post, PostReply, User } from '../types';
import apiClient from './apiClient';
import { RawComment, RawUser, transformPost } from './transformService';
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
      data: {
        post: any;
        new_reply_id: string;
        parent_post_key: string;
        users: {
          new_reply_author: RawUser;
          original_author: RawUser;
        };
      };
      message: string;
      status: string;
    }>(`/posts/${postKey}/comments/${replyId}/promote`, payload);
    
    console.log('✅ Reply promue en post:', response.data);
    
    const postData = response.data.data.post;
    const newPostId = postData._id || `posts/${postData._key}`;
    
    // Créer un Map des utilisateurs depuis la réponse API
    const usersMap = new Map<string, User>();
    if (response.data.data.users) {
      Object.values(response.data.data.users).forEach((rawUser: any) => {
        const user: User = {
          id: rawUser._id,
          name: rawUser.name,
          email: rawUser.email,
          createdAt: new Date(rawUser.createdAt),
          avatar: rawUser.avatar || '',
          bio: rawUser.bio || '',
          isRegistered: rawUser.isRegistered ?? false,
        };
        usersMap.set(rawUser._id, user);
      });
    }
    
    // Transformer le post brut en Post typé avec replies initialisées
    const transformedPost = transformPost(postData, usersMap);
    
    return {
      newPostId: newPostId,
      newReplyId: response.data.data.new_reply_id,
      newPost: transformedPost
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
