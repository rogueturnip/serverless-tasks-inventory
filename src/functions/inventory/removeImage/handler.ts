import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const inventoryId = event.pathParameters?.id;
    const imageId = event.pathParameters?.imageId;

    // Validation
    if (!inventoryId || !imageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Inventory ID and Image ID are required",
        }),
      };
    }

    await db
      .deleteFrom("inventory_images")
      .where("inventory_id", "=", inventoryId)
      .where("user_image_id", "=", imageId)
      .execute();

    return {
      statusCode: 204,
      body: JSON.stringify({
        message: "Image successfully unlinked from inventory",
      }),
    };
  } catch (error) {
    console.error("Error unlinking image from inventory", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to unlink inventory from task" }),
    };
  } finally {
    await db.destroy();
  }
};
