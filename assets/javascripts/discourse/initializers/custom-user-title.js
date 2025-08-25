import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-user-title",
  
  initialize() {
    withPluginApi("0.8.24", (api) => {
      console.log('Custom user title plugin initialized');
      
      // Method to process posts for custom titles
      function processCustomTitles() {
        console.log('Custom user title: processing posts...');
        
        // Try different selectors for different Discourse versions
        const postSelectors = [
          '.topic-post:not([data-custom-title-processed])',
          'article:not([data-custom-title-processed])',
          '.post:not([data-custom-title-processed])'
        ];
        
        let posts = [];
        for (const selector of postSelectors) {
          posts = document.querySelectorAll(selector);
          if (posts.length > 0) break;
        }
        
        console.log(`Found ${posts.length} posts using selector`);
        
        for (const post of posts) {
          const nameLink = post.querySelector('.names a') || post.querySelector('.post-info .username a') || post.querySelector('[data-user-card]');
          if (nameLink) {
            // Try different ways to get post ID
            let postId = post.getAttribute('data-post-id') || 
                        post.getAttribute('id')?.replace('post_', '') ||
                        post.querySelector('[data-post-id]')?.getAttribute('data-post-id');
                        
            console.log('Processing post ID:', postId, 'element:', post.tagName, 'classes:', post.className);
            
            // Get username from the name link
            const username = nameLink.textContent.trim();
            console.log('Processing username:', username);
            
            // Try multiple methods to access post data
            let postData = null;
            
            // Method 1: Try to get from topic controller by post ID
            if (postId) {
              try {
                const topicController = api.container.lookup('controller:topic');
                if (topicController?.model?.postStream) {
                  postData = topicController.model.postStream.posts.find(p => p.id == postId);
                  console.log('Found post data via controller (ID):', postData?.custom_user_title);
                }
              } catch (e) {
                console.log('Controller method failed:', e);
              }
            }
            
            // Method 2: Try to find by username in post stream
            if (!postData?.custom_user_title) {
              try {
                const topicController = api.container.lookup('controller:topic');
                if (topicController?.model?.postStream) {
                  postData = topicController.model.postStream.posts.find(p => p.username === username);
                  console.log('Found post data via controller (username):', postData?.custom_user_title);
                }
              } catch (e) {
                console.log('Username lookup method failed:', e);
              }
            }
            
            // Method 3: Try to get from application controller  
            if (!postData?.custom_user_title && postId) {
              try {
                const appController = api.container.lookup('controller:application');
                const currentRoute = appController?.currentRoute;
                if (currentRoute?.modelFor && currentRoute.modelFor('topic')?.postStream) {
                  postData = currentRoute.modelFor('topic').postStream.posts.find(p => p.id == postId);
                  console.log('Found post data via route:', postData?.custom_user_title);
                }
              } catch (e) {
                console.log('Route method failed:', e);
              }
            }
            
            // Debug: Log all post data keys to see what's available
            if (postData) {
              console.log('Available post data keys:', Object.keys(postData));
              console.log('Post data sample:', {
                id: postData.id,
                username: postData.username,
                custom_user_title: postData.custom_user_title,
                user_custom_fields: postData.user_custom_fields
              });
            }
            
            // Add custom title if found
            if (postData && postData.custom_user_title && !nameLink.querySelector('.custom-user-title')) {
              console.log('Adding custom title:', postData.custom_user_title);
              const titleSpan = document.createElement('span');
              titleSpan.className = 'custom-user-title';
              titleSpan.textContent = ` ${postData.custom_user_title}`;
              nameLink.appendChild(titleSpan);
            }
          }
          
          post.setAttribute('data-custom-title-processed', 'true');
        }
      }
      
      // Process on page change
      api.onPageChange(processCustomTitles);
      
      // Also process when posts are loaded/updated
      api.onAppEvent('post-stream:loaded', processCustomTitles);
      api.onAppEvent('post:updated', processCustomTitles);
      
      // Initial processing after a delay
      setTimeout(processCustomTitles, 1000);
    });
  }
};