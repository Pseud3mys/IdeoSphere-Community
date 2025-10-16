// src/services/detailsService.ts

import apiClient from './apiClient';
import { Idea, Post, DiscussionTopic, Rating, PostReply } from '../types';
import {
  transformUser,
  transformIdea,
  transformPost,
  transformPostToDiscussion,
  transformFeedbackToRatings,
  RawUser,
  RawFeedData,
  RawIdea,
  RawPost,
  RawFeedback
} from './transformService';

// =============================================================================
// INTERNAL API FUNCTIONS (previously in apiService.ts)
// =============================================================================

/**
 * Fetches a single idea by its ID directly from the API.
 * Corresponds to `GET /ideas/{key}`.
 */
async function getIdeaById(ideaId: string): Promise<Idea | null> {
  try {
    const ideaKey = ideaId.split('/')[1];
    const response = await apiClient.get<{ content: RawIdea, users: RawUser[] }>(`/ideas/${ideaKey}`);
    const usersMap = new Map(response.data.users.map(u => [u._id, transformUser(u)]));
    return transformIdea(response.data.content, usersMap);
  } catch (error) {
    console.error(`❌ Error fetching idea ${ideaId}:`, error);
    return null;
  }
}

/**
 * Fetches a single post by its ID directly from the API.
 * Corresponds to `GET /posts/{key}`.
 */
async function getPostById(postId: string): Promise<Post | null> {
  try {
    const postKey = postId.split('/')[1];
    const response = await apiClient.get<{ content: RawPost, users: RawUser[] }>(`/posts/${postKey}`);
    const usersMap = new Map(response.data.users.map(u => [u._id, transformUser(u)]));
    return transformPost(response.data.content, usersMap);
  } catch (error) {
    console.error(`❌ Error fetching post ${postId}:`, error);
    return null;
  }
}

/**
 * Fetches feedback for a given content item to extract ratings.
 * Corresponds to `GET /{contentType}/{contentKey}/feedback`.
 */
async function fetchRatingsForContent(contentId: string): Promise<Rating[]> {
    try {
        const contentKey = contentId.split('/')[1];
        const contentType = contentId.split('/')[0]; // e.g., 'ideas' or 'posts'
        const response = await apiClient.get<RawFeedback[]>(`/${contentType}/${contentKey}/feedback`);
        return transformFeedbackToRatings(response.data);
    } catch (error) {
        console.error(`❌ Error fetching feedback for content ${contentId}:`, error);
        return [];
    }
}

// =============================================================================
// EXPORTED SERVICE FUNCTIONS
// =============================================================================

export interface IdeaDetailsResult {
  idea: Idea;
  discussions?: DiscussionTopic[];
  ratings?: Rating[];
}

export interface PostDetailsResult {
  post: Post;
  replies?: PostReply[];
}

/**
 * Retrieves the ratings for an idea via the API.
 * Uses the `.../feedback` endpoint.
 */
export async function fetchIdeaRatings(ideaId: string): Promise<Rating[]> {
  console.log(`[API] fetchIdeaRatings - ${ideaId}`);
  try {
    const ratings = await fetchRatingsForContent(ideaId);
    console.log(`[API] fetchIdeaRatings - ${ratings.length} ratings found`);
    return ratings;
  } catch (error) {
    console.error(`[API] fetchIdeaRatings - Error:`, error);
    return [];
  }
}

/**
 * Retrieves the replies (comments) for a post.
 * A full post object already includes its comments after a call to getPostById.
 */
export async function fetchPostReplies(postId: string): Promise<PostReply[]> {
  console.log(`[API] fetchPostReplies - ${postId}`);
  try {
    const post = await getPostById(postId);
    if (!post) {
      console.log(`[API] fetchPostReplies - Post not found: ${postId}`);
      return [];
    }
    // Sort replies by creation date
    const replies = post.replies.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    console.log(`[API] fetchPostReplies - ${replies.length} replies found`);
    return replies;
  } catch (error) {
    console.error(`[API] fetchPostReplies - Error:`, error);
    return [];
  }
}

/**
 * Retrieves the discussions associated with an idea.
 * Calls the /ideas/{key}/discussions route.
 */
export async function fetchDiscussions(ideaId: string): Promise<DiscussionTopic[]> {
  console.log(`[API] fetchDiscussions - for idea ${ideaId}`);
  try {
    const ideaKey = ideaId.split('/')[1];
    const response = await apiClient.get<RawFeedData>(`/ideas/${ideaKey}/discussions`);

    const rawData = response.data;
    if (!rawData || !rawData.content) {
        return [];
    }

    const usersMap = new Map(rawData.users.map(u => [u._id, transformUser(u)]));
    const discussions = rawData.content.map(rawPost =>
      transformPostToDiscussion(rawPost as RawPost, usersMap)
    );

    console.log(`[API] fetchDiscussions - ${discussions.length} discussions found`);
    return discussions;
  } catch (error) {
    console.error(`[API] fetchDiscussions - Error:`, error);
    return [];
  }
}

/**
 * Unified function to retrieve details for a specific idea tab.
 * Note: For lineage, use `fetchLineage` from lineageService.
 */
export async function fetchIdeaTabDetails(
  ideaId: string,
  tab: 'discussions' | 'ratings'
): Promise<IdeaDetailsResult | null> {
  console.log(`[API] fetchIdeaTabDetails - Idea ${ideaId}, tab "${tab}"`);
  try {
    const idea = await getIdeaById(ideaId);
    if (!idea) {
      console.log(`[API] fetchIdeaTabDetails - Idea not found: ${ideaId}`);
      return null;
    }

    const result: IdeaDetailsResult = { idea };

    switch (tab) {
      case 'discussions':
        result.discussions = await fetchIdeaDiscussions(ideaId);
        break;
      case 'ratings':
        result.ratings = await fetchIdeaRatings(ideaId);
        break;
    }

    console.log(`[API] fetchIdeaTabDetails - OK for tab "${tab}"`);
    return result;
  } catch (error) {
    console.error(`[API] fetchIdeaTabDetails - Error:`, error);
    return null;
  }
}

/**
 * Unified function to retrieve details for a specific post tab.
 * Note: For lineage, use `fetchPostLineage` from lineageService.
 */
export async function fetchPostTabDetails(
  postId: string,
  tab: 'content' | 'discussions'
): Promise<PostDetailsResult | null> {
  console.log(`[API] fetchPostTabDetails - Post ${postId}, tab "${tab}"`);
  try {
    const post = await getPostById(postId);
    if (!post) {
      console.log(`[API] fetchPostTabDetails - Post not found: ${postId}`);
      return null;
    }

    const result: PostDetailsResult = { post };

    // The 'content' tab loads the full post, which already includes replies.
    if (tab === 'content') {
        result.replies = post.replies;
    }

    console.log(`[API] fetchPostTabDetails - OK for tab "${tab}"`);
    return result;
  } catch (error) {
    console.error(`[API] fetchPostTabDetails - Error:`, error);
    return null;
  }
}