import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().optional(),
});

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const inventoryId = event.pathParameters?.taskId;
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
    if (!input.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    // Check if the task-image combination exists
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
          error: "Inventory-Image combination not found",
        }),
      };
    }

    await db
      .updateTable("inventory_images")
      .set({
        text: text || null,
      })
      .where("inventory_id", "=", inventoryId)
      .where("user_image_id", "=", imageId)
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Image text updated successfully" }),
    };
  } catch (error) {
    console.error("Error updating image text", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update image text" }),
    };
  } finally {
    await db.destroy();
  }
};
