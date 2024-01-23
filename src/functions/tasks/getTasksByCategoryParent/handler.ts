import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/tasks";

import { db } from "@libs/database";
import { jsonArrayFrom } from "kysely/helpers/postgres";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters } = event;
  const cursor = queryStringParameters?.cursor;
  const limit = parseInt(queryStringParameters?.limit || "10", 10);

  try {
    let query = db
      .selectFrom("tasks_by_top_level_category as tc")
      .select(["tc.category_id", "tc.category_name"])
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("tasks as t")
            .select([
              "t.id",
              "t.title",
              "t.description",
              "t.display_image",
              "t.schedule",
              "t.created_at",
            ])
            .select([(eb) => withCategories(eb), (eb) => withImages(eb)])
            .whereRef("tc.task_id", "=", "t.id")
        ).as("tasks"),
      ])
      .where("tc.building_id", "=", building_id)
      .orderBy("tc.category_name")
      .limit(limit);

    if (cursor) {
      query = query.where("tc.category_id", ">", cursor);
    }

    const categoriesWithTasks = await query.execute();
    const lastItem = categoriesWithTasks[categoriesWithTasks.length - 1];
    return {
      statusCode: 200,
      body: JSON.stringify({
        records: categoriesWithTasks,
        cursor: lastItem ? lastItem.category_id : null,
      }),
    };
  } catch (error) {
    console.error("Error fetching tasks grouped by categories", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch tasks" }),
    };
  } finally {
    await db.destroy();
  }
};
