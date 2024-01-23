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
      .leftJoin("inventory_category as ic", "ic.inventory_id", "i.id")
      .whereRef("ic.category_id", "=", "c.id")
      .orderBy("c.label")
  ).as("categories");
}

export function withImages(eb) {
  return jsonArrayFrom(
    eb
      .selectFrom("inventory_images as ii")
      .select(["ii.user_image_id as image_id"])
      .whereRef("ii.inventory_id", "=", eb.ref("i.id"))
      .limit(5)
  ).as("images");
}
