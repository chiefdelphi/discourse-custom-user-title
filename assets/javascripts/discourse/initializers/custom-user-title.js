import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-user-title",
  
  initialize() {
    withPluginApi("0.8.24", (api) => {
      console.log('Custom user title plugin initialized');
      
      // Method to process posts for custom titles
      function processCustomTitles() {
        console.log('Custom user title: processing posts...');
        
        for (const post of document.querySelectorAll('.topic-post:not([data-custom-title-processed])')) {
          const nameLink = post.querySelector('.names a');
          if (nameLink) {
            const postId = post.getAttribute('data-post-id');
            console.log('Processing post ID:', postId);
            
            // Try multiple methods to access post data
            let postData = null;
            
            // Method 1: Try to get from topic controller
            try {
              const topicController = api.container.lookup('controller:topic');
              if (topicController?.model?.postStream) {
                postData = topicController.model.postStream.posts.find(p => p.id == postId);
                console.log('Found post data via controller:', postData?.custom_user_title);
              }
            } catch (e) {
              console.log('Controller method failed:', e);
            }
            
            // Method 2: Try to get from application controller  
            if (!postData?.custom_user_title) {
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