# name: DiscourseCustomUserTitle
# about:
# version: 0.1
# authors: bmartus
# url: https://github.com/bmartus


register_asset "stylesheets/common/discourse-custom-user-title.scss"


enabled_site_setting :discourse_custom_user_title_enabled

PLUGIN_NAME ||= "DiscourseCustomUserTitle".freeze

after_initialize do
  
  # see lib/plugin/instance.rb for the methods available in this context
  

  module ::DiscourseCustomUserTitle
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseCustomUserTitle
    end
  end

  

  
  require_dependency "application_controller"
  class DiscourseCustomUserTitle::ActionsController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_action :ensure_logged_in

    def list
      render json: success_json
    end
  end

  DiscourseCustomUserTitle::Engine.routes.draw do
    get "/list" => "actions#list"
  end

  Discourse::Application.routes.append do
    mount ::DiscourseCustomUserTitle::Engine, at: "/discourse-custom-user-title"
  end
  
end
