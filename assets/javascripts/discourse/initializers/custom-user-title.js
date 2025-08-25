import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-user-title",
  
  initialize() {
    withPluginApi("0.8.24", (api) => {
      // Use preloaded post data instead of AJAX requests
      api.onPageChange(() => {
        setTimeout(() => {
          console.log('Custom user title: processing posts...');
          
          for (const post of document.querySelectorAll('.topic-post:not([data-custom-title-processed])')) {
            const nameLink = post.querySelector('.names a');
            if (nameLink) {
              // Get post data from the DOM element's data attributes
              const postId = post.getAttribute('data-post-id');
              
              // Access the preloaded post data from the topic model
              const topic = api.container.lookup('controller:topic')?.model;
              if (topic && topic.postStream) {
                const postData = topic.postStream.posts.find(p => p.id == postId);
                
                if (postData && postData.custom_user_title) {
                  console.log('Found preloaded custom title:', postData.custom_user_title);
                  
                  // Add custom title if not already present
                  if (!nameLink.querySelector('.custom-user-title')) {
                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'custom-user-title';
                    titleSpan.textContent = ` ${postData.custom_user_title}`;
                    nameLink.appendChild(titleSpan);
                  }
                }
              }
            }
            
            post.setAttribute('data-custom-title-processed', 'true');
          }
        }, 500);
      });
    });
  }
};