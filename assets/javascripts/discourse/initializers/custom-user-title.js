import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-user-title",
  
  initialize() {
    // Add custom CSS
    const css = `
      .custom-user-title {
        font-size: 1em;
        color: var(--primary-medium);
        margin-left: 0.5em;
        font-weight: normal !important;
        display: inline-block;
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    withPluginApi("0.8.24", (api) => {
      // Method to process posts for custom titles
      function processCustomTitles() {
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
        
        for (const post of posts) {
          const nameLink = post.querySelector('.names a') || post.querySelector('.post-info .username a') || post.querySelector('[data-user-card]');
          if (nameLink) {
            // Try different ways to get post ID
            let postId = post.getAttribute('data-post-id') || 
                        post.getAttribute('id')?.replace('post_', '') ||
                        post.querySelector('[data-post-id]')?.getAttribute('data-post-id');
            
            // Get username from the name link
            const username = nameLink.textContent.trim();
            
            // Try multiple methods to access post data
            let postData = null;
            
            // Method 1: Try to get from topic controller by post ID
            if (postId) {
              try {
                const topicController = api.container.lookup('controller:topic');
                if (topicController?.model?.postStream) {
                  postData = topicController.model.postStream.posts.find(p => p.id == postId);
                }
              } catch (e) {
                // Silent fail
              }
            }
            
            // Method 2: Try to find by username in post stream
            if (!postData?.custom_user_title) {
              try {
                const topicController = api.container.lookup('controller:topic');
                if (topicController?.model?.postStream) {
                  postData = topicController.model.postStream.posts.find(p => p.username === username);
                }
              } catch (e) {
                // Silent fail
              }
            }
            
            // Method 3: Try to get from application controller  
            if (!postData?.custom_user_title && postId) {
              try {
                const appController = api.container.lookup('controller:application');
                const currentRoute = appController?.currentRoute;
                if (currentRoute?.modelFor && currentRoute.modelFor('topic')?.postStream) {
                  postData = currentRoute.modelFor('topic').postStream.posts.find(p => p.id == postId);
                }
              } catch (e) {
                // Silent fail
              }
            }
            
            // Add custom title if found
            if (postData && postData.custom_user_title && !nameLink.parentElement.querySelector('.custom-user-title')) {
              const titleSpan = document.createElement('span');
              titleSpan.className = 'custom-user-title';
              titleSpan.textContent = ` ${postData.custom_user_title}`;
              // Insert after the username link instead of inside it
              nameLink.parentElement.insertBefore(titleSpan, nameLink.nextSibling);
            }
          }
          
          post.setAttribute('data-custom-title-processed', 'true');
        }
      }
      
      // Process on page change
      api.onPageChange(processCustomTitles);
      
      // Process when posts are loaded/updated
      api.onAppEvent('post-stream:loaded', processCustomTitles);
      api.onAppEvent('post:updated', processCustomTitles);
      
      // Process on scroll events for virtual scrolling
      api.onAppEvent('post-stream:refresh', processCustomTitles);
      api.onAppEvent('post-stream:posted', processCustomTitles);
      
      // Use MutationObserver to catch dynamically added posts
      const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE && 
                  (node.matches && (node.matches('article') || node.matches('.topic-post') || node.matches('.post')) ||
                   node.querySelector && (node.querySelector('article') || node.querySelector('.topic-post') || node.querySelector('.post')))) {
                shouldProcess = true;
              }
            });
          }
        });
        if (shouldProcess) {
          setTimeout(processCustomTitles, 100);
        }
      });
      
      // Observe the main content area for changes
      const mainContent = document.querySelector('#main-outlet') || document.querySelector('.posts-wrapper') || document.body;
      if (mainContent) {
        observer.observe(mainContent, {
          childList: true,
          subtree: true
        });
      }
      
      // Initial processing after a delay
      setTimeout(processCustomTitles, 1000);
      
      // Regular interval processing as fallback
      setInterval(processCustomTitles, 2000);
    });
  }
};