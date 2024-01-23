import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/inventory";

import { db } from "@libs/database";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { id = null } = {} } = event;

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
      .select((eb) => [withImages(eb)])
      .select((eb) => [withCategories(eb)])
      .where("i.id", "=", id)
      .where("i.building_id", "=", building_id);

    const task = await query.executeTakeFirst();

    return {
      statusCode: 200,
      body: JSON.stringify(task),
    };
  } catch (error) {
    console.log("Error fetching inventory", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        body: JSON.stringify({ error: "Failed to get inventory" }),
      }),
    };
  } finally {
    // await db.destroy();
  }
};
