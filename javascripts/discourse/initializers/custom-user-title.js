import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-user-title",
  
  initialize() {
    withPluginApi("0.8.24", (api) => {
      // Fetch user data and add custom titles
      api.onPageChange(() => {
        setTimeout(async () => {
          console.log('Custom user title: processing posts...');
          
          for (const post of document.querySelectorAll('.topic-post:not([data-custom-title-processed])')) {
            const nameLink = post.querySelector('.names a');
            if (nameLink) {
              const username = nameLink.textContent.trim();
              console.log('Processing username:', username);
              
              try {
                // Fetch user data
                const response = await fetch(`/u/${username}.json`);
                const userData = await response.json();
                console.log('User data for', username, ':', userData);
                
                if (userData.user && userData.user.user_fields && userData.user.user_fields['4']) {
                  const customTitle = userData.user.user_fields['4'];
                  console.log('Found user field 4:', customTitle);
                  
                  // Add custom title
                  if (!nameLink.querySelector('.custom-user-title')) {
                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'custom-user-title';
                    titleSpan.textContent = ` ${customTitle}`;
                    nameLink.appendChild(titleSpan);
                  }
                } else {
                  console.log('No user field 4 found for', username);
                }
              } catch (error) {
                console.error('Error fetching user data for', username, ':', error);
              }
            }
            
            post.setAttribute('data-custom-title-processed', 'true');
          }
        }, 500);
      });
    });
  }
};