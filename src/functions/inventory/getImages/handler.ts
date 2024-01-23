import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const inventoryId = event.pathParameters?.id;
    const cursor = event.queryStringParameters?.cursor;
    const limit = parseInt(event.queryStringParameters?.limit || "10", 10);

    // Validation
    if (!inventoryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "inventory ID is required" }),
      };
    }

    let query = db
      .selectFrom("inventory_images")
      .select(["user_image_id", "text", "inventory_id"])
      .where("inventory_id", "=", inventoryId)
      .orderBy("user_image_id")
      .limit(limit);

    if (cursor) {
      query = query.where("user_image_id", ">", cursor);
    }

    const images = await query.execute();

    return {
      statusCode: 200,
      body: JSON.stringify({
        records: images,
        cursor:
          images.length === limit
            ? images[images.length - 1].user_image_id
            : null,
      }),
    };
  } catch (error) {
    console.error("Error listing inventory images", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to list inventory images" }),
    };
  } finally {
    await db.destroy();
  }
};
