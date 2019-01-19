import { withPluginApi } from "discourse/lib/plugin-api";
import { applyDecorators } from "discourse/widgets/widget";
import { iconNode } from "discourse-common/lib/icon-library";
import { h } from "virtual-dom";
import { formatUsername } from "discourse/lib/utilities";

function initializeDiscourseCustomUserTitle(api) {

  api.reopenWidget("poster-name-title", {

    html(attrs) {
      return attrs.title;
    }

  });

  api.reopenWidget("poster-name", {

    html(attrs) {
      const username = attrs.username;
      const name = attrs.name;
      const nameFirst =
        this.siteSettings.display_name_on_posts &&
        !this.siteSettings.prioritize_username_in_ux &&
        name &&
        name.trim().length > 0;
      const classNames = nameFirst
        ? ["first", "full-name"]
        : ["first", "username"];

      if (attrs.staff) {
        classNames.push("staff");
      }
      if (attrs.admin) {
        classNames.push("admin");
      }
      if (attrs.moderator) {
        classNames.push("moderator");
      }
      if (attrs.new_user) {
        classNames.push("new-user");
      }

      let afterNameContents =
        applyDecorators(this, "after-name", attrs, this.state) || [];

      const primaryGroupName = attrs.primary_group_name;
      if (primaryGroupName && primaryGroupName.length) {
        classNames.push(primaryGroupName);
      }
      let nameContents = [this.userLink(attrs, nameFirst ? name : username)];

      if (this.settings.showGlyph) {
        const glyph = this.posterGlyph(attrs);
        if (glyph) {
          nameContents.push(glyph);
        }
      }
      nameContents = nameContents.concat(afterNameContents);

      const contents = [
        h("span", { className: classNames.join(" ") }, nameContents)
      ];

      if (!this.settings.showNameAndGroup) {
        return contents;
      }

      if (
        name &&
        this.siteSettings.display_name_on_posts &&
        sanitizeName(name) !== sanitizeName(username)
      ) {
        contents.push(
          h(
            "span.second." + (nameFirst ? "username" : "full-name"),
            [this.userLink(attrs, nameFirst ? username : name)].concat(
              afterNameContents
            )
          )
        );
      }

      let title = attrs.user_title;

      if (attrs.userCustomFields && attrs.userCustomFields.user_field_4) {
          title = attrs.userCustomFields.user_field_4;
      }

      if (title && title.length) {
        contents.push(
          this.attach("poster-name-title", { title, primaryGroupName })
        );
      }

      return contents;
    }

  });

}

export default {
  name: "discourse-custom-user-title",

  initialize() {
    withPluginApi("0.8.24", initializeDiscourseCustomUserTitle);
  }
};
