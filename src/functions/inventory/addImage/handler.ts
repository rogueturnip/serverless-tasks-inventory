import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().optional(),
});

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const inventoryId = event.pathParameters?.id;
    const imageId = event.pathParameters?.imageId;
    const { text } = JSON.parse(event.body) || {};

    // Validation
    if (!inventoryId || !imageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Inventory ID and Image ID are required",
        }),
      };
    }

    // Validate input
    const input = inputSchema.safeParse(JSON.parse(event.body));
    if (!input.success && !event.body == null) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    // Check if the inventory-image combination exists
    const existingLink = await db
      .selectFrom("inventory_images")
      .selectAll()
      .where("inventory_id", "=", inventoryId)
      .where("user_image_id", "=", imageId)
      .executeTakeFirst();

    if (existingLink) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Inventory-Image combination exists",
        }),
      };
    }

    await db
      .insertInto("inventory_images")
      .values({
        inventory_id: inventoryId,
        user_image_id: imageId,
        text: text || null,
      })
      .execute();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "inventory linked to image successfully",
      }),
    };
  } catch (error) {
    console.error("Error linking inventory to image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to link inventory to image" }),
    };
  } finally {
    // await db.destroy();
  }
};
