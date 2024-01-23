import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const taskId = event.pathParameters?.id;
    const cursor = event.queryStringParameters?.cursor;
    const limit = parseInt(event.queryStringParameters?.limit || "10", 10);

    // Validation
    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task ID is required" }),
      };
    }

    let query = db
      .selectFrom("task_images")
      .select(["user_image_id", "text", "task_id"])
      .where("task_id", "=", taskId)
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
    console.error("Error listing task images", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to list task images" }),
    };
  } finally {
    await db.destroy();
  }
};
