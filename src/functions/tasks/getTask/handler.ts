import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/tasks";

import { db } from "@libs/database";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { id = null } = {} } = event;

  try {
    let query = db
      .selectFrom("tasks as t")
      .select([
        "t.id",
        "t.title",
        "t.description",
        "t.display_image",
        "t.schedule",
        "t.created_at",
      ])
      .select((eb) => [withImages(eb)])
      .select((eb) => [withCategories(eb)])
      .where("t.id", "=", id)
      .where("t.building_id", "=", building_id);

    const task = await query.executeTakeFirst();

    return {
      statusCode: 200,
      body: JSON.stringify(task),
    };
  } catch (error) {
    console.log("Error fetching task", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        body: JSON.stringify({ error: "Failed to get task" }),
      }),
    };
  } finally {
    await db.destroy();
  }
};
