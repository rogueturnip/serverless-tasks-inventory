import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().optional(),
});

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const taskId = event.pathParameters?.id;
    const imageId = event.pathParameters?.imageId;
    const { text } = JSON.parse(event.body) || {};

    // Validation
    if (!taskId || !imageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task ID and Image ID are required" }),
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
      .selectFrom("task_images")
      .selectAll()
      .where("task_id", "=", taskId)
      .where("user_image_id", "=", imageId)
      .executeTakeFirst();

    if (existingLink) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Task-Image combination not found" }),
      };
    }

    await db
      .insertInto("task_images")
      .values({
        task_id: taskId,
        user_image_id: imageId,
        text: text || null,
      })
      .execute();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Task linked to image successfully" }),
    };
  } catch (error) {
    console.error("Error linking task to image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to link task to image" }),
    };
  } finally {
    await db.destroy();
  }
};
