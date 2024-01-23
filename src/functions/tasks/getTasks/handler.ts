import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { sql } from "kysely";
import { withCategories } from "@libs/tasks";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters } = event;
  const {
    search = null, // uses vector and can be used for autocomplete
    cursor = null, // the last brand id on the page
  } = queryStringParameters || {};

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
      .select((eb) => [withCategories(eb)])
      .where("t.building_id", "=", building_id)
      .orderBy("t.title")
      .limit(10);

    if (search) {
      query = query.where(
        sql<any>`to_tsvector('english', reverse(t.title)) @@ to_tsquery('english', reverse(${search}) || ':*') OR
          to_tsvector('english', t.title) @@ to_tsquery('english', ${search} || ':*')`
      );
      query = query.where(
        sql<any>`to_tsvector('english', reverse(t.description)) @@ to_tsquery('english', reverse(${search}) || ':*') OR
          to_tsvector('english', t.description) @@ to_tsquery('english', ${search} || ':*')`
      );
    }
    if (cursor) {
      query = query.where("t.id", ">", cursor); // Fetch records after the cursor
    }

    const tasks = await query.execute();
    const lastTask = tasks[tasks.length - 1];

    return {
      statusCode: 200,
      body: JSON.stringify({
        records: tasks,
        cursor: lastTask ? lastTask.id : null,
      }),
    };
  } catch (error) {
    console.log("Error fetching tasks", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        body: JSON.stringify({ error: "Failed to get tasks" }),
      }),
    };
  } finally {
    await db.destroy();
  }
};
