import { acceptance } from "helpers/qunit-helpers";

acceptance("DiscourseCustomUserTitle", { loggedIn: true });

test("DiscourseCustomUserTitle works", async assert => {
  await visit("/admin/plugins/discourse-custom-user-title");

  assert.ok(false, "it shows the DiscourseCustomUserTitle button");
});
