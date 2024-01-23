import { jsonArrayFrom } from "kysely/helpers/postgres";

export function withCategories(eb) {
  return jsonArrayFrom(
    eb
      .selectFrom("categories as c")
      .select(["c.id", "c.label", "c.parent_id", "c.slug"])
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("category_images as ci")
            .select(["ci.banner", "ci.full", "ci.teaser"])
            .whereRef("ci.category_id", "=", eb.ref("c.id"))
        ).as("images"),
      ])
      .leftJoin("task_category as tc", "tc.task_id", "t.id")
      .whereRef("tc.category_id", "=", "c.id")
      .orderBy("c.label")
  ).as("categories");
}

export function withImages(eb) {
  return jsonArrayFrom(
    eb
      .selectFrom("task_images as ti")
      .select(["ti.user_image_id as image_id"])
      .whereRef("ti.task_id", "=", eb.ref("t.id"))
      .limit(5)
  ).as("images");
}
