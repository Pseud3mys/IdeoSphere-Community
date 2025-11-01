import { SimpleEntityStore, StoreUpdater } from '../store/SimpleEntityStore';
import * as selectors from '../store/simpleSelectors';
import { toast } from 'sonner@2.0.3';

/**
 * Actions de contenu pour l'Entity Store
 * Gère les interactions avec le contenu (like, support, ignore, report, etc.)
 */
export function createContentActions(
  store: SimpleEntityStore,
  actions: any,
  boundSelectors: any,
  navigationActions: any,
  storeUpdater: StoreUpdater
) {
  // Fonction générique pour lier du contenu (discussions, posts, idées) à un contenu (post ou idée)
  const linkContentToContent = (params: {
    sourceType: 'idea' | 'post' | 'discussion';
    sourceIds: string[];
    targetType: 'idea' | 'post';
  }) => {
    console.log(`🔗 Liaison de ${params.sourceIds.length} ${params.sourceType}(s) vers ${params.targetType}`);
    
    // D'abord, nettoyer TOUTES les données pré-remplies précédentes
    actions.setPrefilledSourceIdea(null);
    actions.setPrefilledSourcePostId(null);
    actions.setPrefilledLinkedContent([]);
    actions.setPrefilledSelectedDiscussions([]);
    actions.setPrefilledLocation(null);
    
    console.log(`🧹 Toutes les données pré-remplies précédentes ont été supprimées`);
    
    // Ensuite, préparer les nouvelles données pré-remplies selon le type source
    if (params.sourceType === 'discussion') {
      actions.setPrefilledSelectedDiscussions(params.sourceIds);
    } else if (params.sourceType === 'idea') {
      if (params.sourceIds.length > 0) {
        actions.setPrefilledSourceIdea(params.sourceIds[0]);
      }
    } else if (params.sourceType === 'post') {
      if (params.sourceIds.length > 0) {
        actions.setPrefilledSourcePostId(params.sourceIds[0]);
      }
    }
    
    // Note: Navigation is now handled by the caller using useNavigate()
    console.log(`✅ Pré-remplissage pour création de ${params.targetType}`);
  };
  
  const contentActions = {
    // Actions de soutien et interaction
    toggleIdeaSupport: async (ideaId: string) => {
      try {
        const { toggleSupportOnApi } = await import('../api/interactionService');
        
        // Utiliser storeUpdater avec une fonction pour éviter les stale closures
        storeUpdater(prevStore => {
          // 1. Lire l'état le plus récent
          const idea = selectors.getIdeaById(prevStore)(ideaId);
          const currentUser = selectors.getCurrentUser(prevStore);

          if (!idea || !currentUser) return {}; // Ne rien mettre à jour

          const isSupporting = idea.supporters?.includes(currentUser.id); // ✅ supporters est maintenant string[]
          const action = isSupporting ? 'unsupport' : 'support';

          // 2. Appeler l'API avec isCurrentlySupporting calculé ici dans le hook
          // Note: L'API sera appelée mais on gère l'état localement
          toggleSupportOnApi(ideaId, currentUser.id, 'idea', isSupporting).then(result => {
            if (!result?.success) {
              console.error('❌ Échec de l\'API, état local non synchronisé');
            }
          }).catch(error => {
            console.error('❌ Erreur API:', error);
          });

          // 3. Calculer le nouvel état à partir de prevStore
          const newSupporters = isSupporting
            ? (idea.supporters || []).filter(id => id !== currentUser.id) // ✅ Filtrer par ID
            : [...(idea.supporters || []), currentUser.id]; // ✅ Ajouter l'ID

          const updatedIdea = {
            ...idea,
            supporters: newSupporters,
            supportCount: newSupporters.length
          };

          // 4. Retourner uniquement les parties du store qui ont changé
          return {
            ideas: {
              ...prevStore.ideas,
              [ideaId]: updatedIdea
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors du toggle de support:', error);
      }
    },
    
    togglePostLike: async (postId: string) => {
      try {
        const { toggleSupportOnApi } = await import('../api/interactionService');
        
        // Utiliser storeUpdater avec une fonction pour éviter les stale closures
        storeUpdater(prevStore => {
          // 1. Lire l'état le plus récent
          const post = selectors.getPostById(prevStore)(postId);
          const currentUser = selectors.getCurrentUser(prevStore);

          if (!post || !currentUser) return {}; // Ne rien mettre à jour

          const isSupporting = post.supporters?.includes(currentUser.id);
          const action = isSupporting ? 'unsupport' : 'support';

          // 2. Appeler l'API avec isCurrentlySupporting calculé ici dans le hook
          toggleSupportOnApi(postId, currentUser.id, 'post', isSupporting).then(result => {
            if (!result?.success) {
              console.error('❌ Échec de l\'API, état local non synchronisé');
            }
          }).catch(error => {
            console.error('❌ Erreur API:', error);
          });

          // 3. Calculer le nouvel état à partir de prevStore
          const newSupporters = isSupporting
            ? (post.supporters || []).filter(userId => userId !== currentUser.id)
            : [...(post.supporters || []), currentUser.id];

          const updatedPost = {
            ...post,
            supporters: newSupporters,
            supportCount: newSupporters.length
          };

          // 4. Retourner uniquement les parties du store qui ont changé
          return {
            posts: {
              ...prevStore.posts,
              [postId]: updatedPost
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors du toggle de support:', error);
      }
    },
    
    // Actions d'évaluation
    rateIdea: async (ideaId: string, criterionId: string, value: number) => {
      // ✅ Récupérer l'utilisateur pour l'appel API initial
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) return;
      
      try {
        const { rateIdeaOnApi } = await import('../api/interactionService');
        
        // 1. Appeler l'API pour enregistrer l'évaluation
        const result = await rateIdeaOnApi(ideaId, currentUser.id, criterionId, value);
        
        if (!result || !result.success) {
          console.error('❌ Échec de l\'évaluation via l\'API');
          toast.error('Erreur lors de l\'enregistrement de votre évaluation');
          return;
        }
        
        // 2. ✅ Approche optimisée : mettre à jour intelligemment le tableau de ratings
        // L'API ne renvoie que le rating modifié, on l'intègre dans le tableau existant
        storeUpdater(prevStore => {
          const idea = selectors.getIdeaById(prevStore)(ideaId);
          if (!idea) return {};

          // Copier le tableau de ratings existant
          const currentRatings = [...(idea.ratings || [])];
          
          // ✅ BUGFIX: Utiliser result.rating.userId (du rating retourné par l'API)
          // au lieu de currentUser.id (stale closure)
          // Cela garantit qu'on cherche avec le bon userId qui correspond au rating reçu
          const existingRatingIndex = currentRatings.findIndex(
            r => r.criterionId === result.rating.criterionId && r.userId === result.rating.userId
          );
          
          // Créer le nouveau tableau de ratings
          let updatedRatings: typeof currentRatings;
          
          if (existingRatingIndex >= 0) {
            // Remplacer le rating existant
            updatedRatings = [...currentRatings];
            updatedRatings[existingRatingIndex] = result.rating;
            console.log('✅ [Hook] Rating mis à jour dans le store pour critère:', criterionId, 'userId:', result.rating.userId);
          } else {
            // Ajouter le nouveau rating
            updatedRatings = [...currentRatings, result.rating];
            console.log('✅ [Hook] Nouveau rating ajouté au store pour critère:', criterionId, 'userId:', result.rating.userId);
          }

          const updatedIdea = {
            ...idea,
            ratings: updatedRatings
          };

          return {
            ideas: {
              ...prevStore.ideas,
              [ideaId]: updatedIdea
            }
          };
        });
        
        toast.success('Évaluation enregistrée');
      } catch (error) {
        console.error('❌ Erreur lors de l\'évaluation:', error);
        toast.error('Erreur lors de l\'évaluation');
      }
    },
    
    // Charger les ratings d'une idée
    loadIdeaRatings: async (ideaId: string) => {
      try {
        const { getIdeaRatingsOnApi } = await import('../api/interactionService');
        
        // 1. Récupérer les ratings depuis l'API
        const ratings = await getIdeaRatingsOnApi(ideaId);
        
        if (!ratings) {
          console.error('❌ Échec du chargement des ratings');
          return;
        }
        
        console.log('✅ [contentActions] Ratings chargés pour idée:', ideaId, ':', ratings.length, 'évaluations');
        
        // 2. Mettre à jour le store avec les ratings récupérés
        storeUpdater(prevStore => {
          const idea = selectors.getIdeaById(prevStore)(ideaId);
          if (!idea) return {};

          const updatedIdea = {
            ...idea,
            ratings
          };

          return {
            ideas: {
              ...prevStore.ideas,
              [ideaId]: updatedIdea
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des ratings:', error);
      }
    },
    
    // Actions de modération
    ignoreIdea: async (ideaId: string) => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) return;
      
      try {
        const { ignoreContentOnApi } = await import('../api/interactionService');
        const success = await ignoreContentOnApi('idea', ideaId, currentUser.id);
        
        if (success) {
          console.log('✅ Idée ignorée:', ideaId);
          // Forcer la redirection immédiate vers discovery en nettoyant tout l'état
          navigationActions.goToDiscovery();
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'ignore:', error);
      }
    },
    
    reportIdea: async (ideaId: string, reason: string = 'Contenu inapproprié') => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) return;
      
      try {
        const { reportContentOnApi } = await import('../api/interactionService');
        const success = await reportContentOnApi('idea', ideaId, currentUser.id, reason);
        
        if (success) {
          console.log('✅ Idée signalée:', ideaId);
          // Forcer la redirection immédiate vers discovery en nettoyant tout l'état
          navigationActions.goToDiscovery();
        }
      } catch (error) {
        console.error('❌ Erreur lors du signalement:', error);
      }
    },
    
    ignorePost: async (postId: string) => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) return;
      
      try {
        const { ignoreContentOnApi } = await import('../api/interactionService');
        const success = await ignoreContentOnApi('post', postId, currentUser.id);
        
        if (success) {
          console.log('✅ Post ignoré:', postId);
          // Forcer la redirection immédiate vers discovery en nettoyant tout l'état
          navigationActions.goToDiscovery();
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'ignore:', error);
      }
    },
    
    reportPost: async (postId: string, reason: string = 'Contenu inapproprié') => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) return;
      
      try {
        const { reportContentOnApi } = await import('../api/interactionService');
        const success = await reportContentOnApi('post', postId, currentUser.id, reason);
        
        if (success) {
          console.log('✅ Post signalé:', postId);
          // Forcer la redirection immédiate vers discovery en nettoyant tout l'état
          navigationActions.goToDiscovery();
        }
      } catch (error) {
        console.error('❌ Erreur lors du signalement:', error);
      }
    },
    
    // Actions de préremplissage
    setPrefillFromIdea: (ideaId: string) => actions.setPrefilledSourceIdea(ideaId),
    clearPrefill: () => {
      actions.setPrefilledSourceIdea(null);
      actions.setPrefilledLinkedContent([]);
      actions.setPrefilledSelectedDiscussions([]);
      actions.setPrefilledLocation(null); // Nettoyer la localisation pré-remplie
      actions.setPrefilledSourcePostId(null); // Nettoyer le post source pour la création
    },
    
    // Action pour créer une version depuis une idée
    createVersionFromIdea: (ideaId: string, selectedDiscussionIds: string[]) => {
      console.log(`🔄 Création version depuis idée ${ideaId} avec ${selectedDiscussionIds.length} discussions`);
      
      // Utiliser la fonction générique de liaison
      linkContentToContent({
        sourceType: 'discussion',
        sourceIds: selectedDiscussionIds,
        targetType: 'idea'
      });
      
      // Ajouter aussi l'idée source
      actions.setPrefilledSourceIdea(ideaId);
      
      console.log(`✅ Navigation vers création avec idée source ${ideaId}`);
    },
    
    // Exposer la fonction générique de liaison de contenu
    linkContentToContent,
    
    // Créer un post de réponse depuis un post existant
    createResponsePost: (postId: string) => {
      console.log(`📝 Création d'un post de réponse depuis le post ${postId}`);
      linkContentToContent({
        sourceType: 'post',
        sourceIds: [postId],
        targetType: 'post'
      });
      // Naviguer vers la page de création de post
      navigationActions.goToCreatePost();
    },
    
    // Promouvoir un post en idée
    promotePostToIdea: (postId: string) => {
      console.log(`🚀 Promotion du post ${postId} en idée`);
      linkContentToContent({
        sourceType: 'post',
        sourceIds: [postId],
        targetType: 'idea'
      });
      // Naviguer vers la page de création d'idée
      navigationActions.goToCreateIdea();
    },
    
    // Actions d'onboarding
    showOnboarding: () => actions.setShowOnboarding(true),
    hideOnboarding: () => actions.setShowOnboarding(false),
    
    // Action de vérification de permission
    canCreateIdea: (): boolean => {
      const currentUser = boundSelectors.getCurrentUser();
      return currentUser?.isRegistered || false;
    },
    
    // Actions de réponse de post
    addPostReply: async (postId: string, content: string): Promise<string | null> => {
      try {
        const { addPostReplyOnApi } = await import('../api/interactionService');
        
        const currentUser = boundSelectors.getCurrentUser();
        if (!currentUser) {
          console.error('❌ Utilisateur non connecté');
          return null;
        }
        
        // Appeler l'API qui retourne maintenant l'objet PostReply complet
        const newReply = await addPostReplyOnApi(postId, currentUser.id, content);
        
        if (!newReply) {
          console.error('❌ Échec de l\'ajout de la réponse');
          return null;
        }
        
        // Mettre à jour le store avec l'objet retourné par l'API
        storeUpdater(prevStore => {
          const post = selectors.getPostById(prevStore)(postId);
          if (!post) return {};
          
          const updatedPost = {
            ...post,
            replies: [...post.replies, newReply]
          };
          
          console.log('✅ Réponse ajoutée au post');
          
          return {
            posts: {
              ...prevStore.posts,
              [postId]: updatedPost
            }
          };
        });
        
        return newReply.id;
      } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la réponse:', error);
        return null;
      }
    },
    
    likePostReply: async (postId: string, replyId: string) => {
      try {
        const { togglePostReplyLikeOnApi } = await import('../api/interactionService');
        
        storeUpdater(prevStore => {
          const post = selectors.getPostById(prevStore)(postId);
          const currentUser = selectors.getCurrentUser(prevStore);
          
          if (!post || !currentUser) return {};
          
          // Trouver la réponse
          const replyIndex = post.replies.findIndex(r => r.id === replyId);
          if (replyIndex === -1) return {};
          
          const reply = post.replies[replyIndex];
          const isLiked = reply.likes?.includes(currentUser.id);
          
          // Appeler l'API de manière asynchrone
          togglePostReplyLikeOnApi(postId, replyId, currentUser.id).then(success => {
            if (!success) {
              console.error('❌ Échec de l\'API pour le like de la réponse');
            }
          }).catch(error => {
            console.error('❌ Erreur API:', error);
          });
          
          // Mettre à jour localement
          const newLikes = isLiked
            ? reply.likes.filter(id => id !== currentUser.id)
            : [...reply.likes, currentUser.id];
          
          const updatedReplies = [...post.replies];
          updatedReplies[replyIndex] = {
            ...reply,
            likes: newLikes,
            likeCount: newLikes.length
          };
          
          const updatedPost = {
            ...post,
            replies: updatedReplies
          };
          
          console.log('✅ Like de réponse mis à jour');
          
          return {
            posts: {
              ...prevStore.posts,
              [postId]: updatedPost
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors du like de la réponse:', error);
      }
    },
    
    // Actions de discussion
    upvoteDiscussionTopic: async (topicId: string) => {
      try {
        const { upvoteDiscussionTopicOnApi } = await import('../api/interactionService');
        
        storeUpdater(prevStore => {
          const topic = selectors.getDiscussionTopicById(prevStore)(topicId);
          const currentUser = selectors.getCurrentUser(prevStore);
          
          if (!topic || !currentUser) return {};
          
          const hasUpvoted = topic.upvotes.includes(currentUser.id);
          
          // Appeler l'API de manière asynchrone
          upvoteDiscussionTopicOnApi(topicId, currentUser.id).then(success => {
            if (!success) {
              console.error('❌ Échec de l\'API pour l\'upvote du topic');
            }
          }).catch(error => {
            console.error('❌ Erreur API:', error);
          });
          
          // Mettre à jour localement
          const newUpvotes = hasUpvoted
            ? topic.upvotes.filter(id => id !== currentUser.id)
            : [...topic.upvotes, currentUser.id];
          
          const updatedTopic = {
            ...topic,
            upvotes: newUpvotes
          };
          
          console.log('✅ Upvote topic mis à jour');
          
          return {
            discussionTopics: {
              ...prevStore.discussionTopics,
              [topicId]: updatedTopic
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors de l\'upvote du topic:', error);
      }
    },
    
    upvoteDiscussionPost: async (topicId: string, postId: string) => {
      try {
        const { upvoteDiscussionPostOnApi } = await import('../api/interactionService');
        
        storeUpdater(prevStore => {
          const topic = selectors.getDiscussionTopicById(prevStore)(topicId);
          const currentUser = selectors.getCurrentUser(prevStore);
          
          if (!topic || !currentUser) return {};
          
          // Trouver le post dans le topic
          const postIndex = topic.posts.findIndex(p => p.id === postId);
          if (postIndex === -1) return {};
          
          const post = topic.posts[postIndex];
          const hasUpvoted = post.upvotes.includes(currentUser.id);
          
          // Appeler l'API de manière asynchrone
          upvoteDiscussionPostOnApi(topicId, postId, currentUser.id).then(success => {
            if (!success) {
              console.error('❌ Échec de l\'API pour l\'upvote du post');
            }
          }).catch(error => {
            console.error('❌ Erreur API:', error);
          });
          
          // Mettre à jour localement
          const newUpvotes = hasUpvoted
            ? post.upvotes.filter(id => id !== currentUser.id)
            : [...post.upvotes, currentUser.id];
          
          const updatedPosts = [...topic.posts];
          updatedPosts[postIndex] = {
            ...post,
            upvotes: newUpvotes
          };
          
          const updatedTopic = {
            ...topic,
            posts: updatedPosts
          };
          
          console.log('✅ Upvote post de discussion mis à jour');
          
          return {
            discussionTopics: {
              ...prevStore.discussionTopics,
              [topicId]: updatedTopic
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors de l\'upvote du post:', error);
      }
    },
    
    createNewDiscussionTopic: async (
      ideaId: string,
      data: {
        title: string;
        content: string;
        type: 'general' | 'question' | 'suggestion' | 'technical';
      }
    ): Promise<string | null> => {
      try {
        const { createDiscussionTopicOnApi } = await import('../api/interactionService');
        
        const currentUser = boundSelectors.getCurrentUser();
        if (!currentUser) {
          console.error('❌ Utilisateur non connecté');
          return null;
        }
        
        // Appeler l'API - reçoit maintenant un objet DiscussionTopic complet
        const newTopic = await createDiscussionTopicOnApi(ideaId, currentUser.id, data);
        
        if (!newTopic) {
          console.error('❌ Échec de la création du topic');
          return null;
        }
        
        // Mettre à jour le store avec l'objet DiscussionTopic reçu de l'API
        storeUpdater(prevStore => {
          const idea = selectors.getIdeaById(prevStore)(ideaId);
          if (!idea) return {};
          
          // ✅ Utiliser directement l'objet newTopic de l'API
          // Ajouter le topic au store
          const updatedDiscussionTopics = {
            ...prevStore.discussionTopics,
            [newTopic.id]: newTopic
          };
          
          // Ajouter l'ID du topic à l'idée
          const updatedIdea = {
            ...idea,
            discussionIds: [...idea.discussionIds, newTopic.id]
          };
          
          console.log('✅ Topic de discussion créé avec ID:', newTopic.id);
          
          return {
            discussionTopics: updatedDiscussionTopics,
            ideas: {
              ...prevStore.ideas,
              [ideaId]: updatedIdea
            }
          };
        });
        
        // Retourner l'ID du topic créé
        return newTopic.id;
      } catch (error) {
        console.error('❌ Erreur lors de la création du topic:', error);
        return null;
      }
    },
    
    createDiscussionPost: async (topicId: string, content: string): Promise<string | null> => {
      try {
        const { createDiscussionPostOnApi } = await import('../api/interactionService');
        
        const currentUser = boundSelectors.getCurrentUser();
        if (!currentUser) {
          console.error('❌ Utilisateur non connecté');
          return null;
        }
        
        // Vérifier que topicId est bien une string
        if (typeof topicId !== 'string') {
          console.error('❌ [createDiscussionPost] topicId n\'est pas une string:', typeof topicId, topicId);
          return null;
        }
        
        // Appeler l'API - reçoit maintenant un objet DiscussionPost complet
        const newPost = await createDiscussionPostOnApi(topicId, currentUser.id, content);
        
        if (!newPost) {
          console.error('❌ Échec de la création du post');
          return null;
        }
        
        // Mettre à jour le store avec l'objet DiscussionPost reçu de l'API
        storeUpdater(prevStore => {
          const topic = selectors.getDiscussionTopicById(prevStore)(topicId);
          if (!topic) return {};
          
          // ✅ Utiliser directement l'objet newPost de l'API
          const updatedTopic = {
            ...topic,
            posts: [...topic.posts, newPost]
          };
          
          console.log('✅ Post de discussion créé avec ID:', newPost.id);
          
          return {
            discussionTopics: {
              ...prevStore.discussionTopics,
              [topicId]: updatedTopic
            }
          };
        });
        
        // Retourner l'ID du post créé
        return newPost.id;
      } catch (error) {
        console.error('❌ Erreur lors de la création du post:', error);
        return null;
      }
    },
    
    markDiscussionPostAsAnswer: async (topicId: string, postId: string) => {
      try {
        const { markDiscussionPostAsAnswerOnApi } = await import('../api/interactionService');
        
        const currentUser = boundSelectors.getCurrentUser();
        if (!currentUser) {
          console.error('❌ Utilisateur non connecté');
          return;
        }
        
        // Appeler l'API
        const success = await markDiscussionPostAsAnswerOnApi(topicId, postId, currentUser.id);
        
        if (!success) {
          console.error('❌ Échec du marquage de la réponse');
          return;
        }
        
        // Mettre à jour le store
        storeUpdater(prevStore => {
          const topic = selectors.getDiscussionTopicById(prevStore)(topicId);
          if (!topic) return {};
          
          // Trouver le post
          const postIndex = topic.posts.findIndex(p => p.id === postId);
          if (postIndex === -1) return {};
          
          // Mettre à jour les posts : démarquer tous les autres et marquer celui-ci
          const updatedPosts = topic.posts.map((p, index) => ({
            ...p,
            isAnswer: index === postIndex ? true : false
          }));
          
          const updatedTopic = {
            ...topic,
            posts: updatedPosts
          };
          
          console.log('✅ Post marqué comme réponse acceptée');
          
          return {
            discussionTopics: {
              ...prevStore.discussionTopics,
              [topicId]: updatedTopic
            }
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors du marquage de la réponse:', error);
      }
    }
  };
  
  return contentActions;
}