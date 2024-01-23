import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const taskId = event.pathParameters?.id;
    const imageId = event.pathParameters?.imageId;

    // Validation
    if (!taskId || !imageId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task ID and Image ID are required" }),
      };
    }

    await db
      .deleteFrom("task_images")
      .where("task_id", "=", taskId)
      .where("user_image_id", "=", imageId)
      .execute();

    return {
      statusCode: 204,
      body: JSON.stringify({
        message: "Image successfully unlinked from task",
      }),
    };
  } catch (error) {
    console.error("Error unlinking image from task", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to unlink image from task" }),
    };
  } finally {
    await db.destroy();
  }
};
