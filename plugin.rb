# name: custom-user-title
# about: Adds custom user titles from user field 4 to post data
# version: 1.0
# authors: Custom

after_initialize do
  # Extend PostSerializer to include custom user title
  PostSerializer.class_eval do
    attributes :custom_user_title
    
    def custom_user_title
      return nil unless object.user
      
      # Get user field 4 (custom title)
      user_field = object.user.user_fields&.dig('4')
      user_field.present? ? user_field : nil
    end
    
    def include_custom_user_title?
      object.user.present?
    end
  end
end