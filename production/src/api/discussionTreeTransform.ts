import { Post, User } from '../types';
import { transformPost, transformUser, RawUser } from './transformService';

/**
 * Interface pour la réponse de discussion-tree
 */
export interface RawDiscussionTree {
  main_post: any; // RawPost
  derived_posts: any[]; // RawPost[]
  users: RawUser[];
}

/**
 * Transforme la réponse de discussion-tree en posts structurés
 * Route: GET /api/posts/<post_key>/discussion-tree
 */
export function transformDiscussionTree(data: RawDiscussionTree): {
  mainPost: Post;
  derivedPosts: Post[];
  usersMap: Map<string, User>;
} {
  // Créer la map des utilisateurs
  const usersMap = new Map<string, User>();
  data.users.forEach(rawUser => {
    const user = transformUser(rawUser);
    usersMap.set(user.id, user);
  });

  // Transformer le post principal avec ses comments
  const mainPost = transformPost(data.main_post, usersMap);

  // Transformer tous les posts dérivés avec leurs comments
  const derivedPosts = data.derived_posts.map(rawPost => 
    transformPost(rawPost, usersMap)
  );

  return { mainPost, derivedPosts, usersMap };
}
