import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { sql } from "kysely";
import { withCategories } from "@libs/inventory";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters } = event;
  const {
    space_id = null,
    search = null, // uses vector and can be used for autocomplete
    cursor = null, // the last brand id on the page
  } = queryStringParameters || {};

  try {
    let query = db
      .selectFrom("inventory as i")
      .select([
        "i.id",
        "i.title",
        "i.description",
        "i.display_image",
        "i.created_at",
      ])
      .select((eb) => [withCategories(eb)])
      .where("i.building_id", "=", building_id)
      .orderBy("i.title")
      .limit(10);

    if (search) {
      query = query.where(
        sql<any>`to_tsvector('english', reverse(i.title)) @@ to_tsquery('english', reverse(${search}) || ':*') OR
          to_tsvector('english', i.title) @@ to_tsquery('english', ${search} || ':*')`
      );
      query = query.where(
        sql<any>`to_tsvector('english', reverse(i.description)) @@ to_tsquery('english', reverse(${search}) || ':*') OR
          to_tsvector('english', i.description) @@ to_tsquery('english', ${search} || ':*')`
      );
    }

    if (space_id) {
      query = query.where("i.space_id", "=", space_id);
    }

    if (cursor) {
      query = query.where("i.id", ">", cursor); // Fetch records after the cursor
    }

    const inventories = await query.execute();
    const lastTask = inventories[inventories.length - 1];

    return {
      statusCode: 200,
      body: JSON.stringify({
        records: inventories,
        cursor: lastTask ? lastTask.id : null,
      }),
    };
  } catch (error) {
    console.log("Error fetching inventories", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        body: JSON.stringify({ error: "Failed to get inventories" }),
      }),
    };
  } finally {
    // await db.destroy();
  }
};
