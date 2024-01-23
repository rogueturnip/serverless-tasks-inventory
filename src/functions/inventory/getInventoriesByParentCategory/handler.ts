import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/inventory";

import { db } from "@libs/database";
import { jsonArrayFrom } from "kysely/helpers/postgres";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters } = event;
  const cursor = queryStringParameters?.cursor;
  const limit = parseInt(queryStringParameters?.limit || "10", 10);

  try {
    let query = db
      .selectFrom("inventory_by_top_level_category as ic")
      .select(["ic.category_id", "ic.category_name"])
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("inventory as i")
            .select([
              "i.id",
              "i.title",
              "i.description",
              "i.display_image",
              "i.created_at",
            ])
            .select([(eb) => withCategories(eb), (eb) => withImages(eb)])
            .whereRef("ic.inventory_id", "=", "i.id")
        ).as("inventory"),
      ])
      .where("ic.building_id", "=", building_id)
      .orderBy("ic.category_name")
      .limit(limit);

    if (cursor) {
      query = query.where("ic.category_id", ">", cursor);
    }

    const categoriesWithInventory = await query.execute();
    const lastItem =
      categoriesWithInventory[categoriesWithInventory.length - 1];
    return {
      statusCode: 200,
      body: JSON.stringify({
        records: categoriesWithInventory,
        cursor: lastItem ? lastItem.category_id : null,
      }),
    };
  } catch (error) {
    console.error("Error fetching inventory grouped by categories", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch tasks" }),
    };
  } finally {
    await db.destroy();
  }
};
