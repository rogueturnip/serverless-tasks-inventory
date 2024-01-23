import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { z } from "zod";

const user_id = "e2881cae-8d74-4ae3-9742-0693f54eba39";

const inputSchema = z.enum(["skip", "complete"]);

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const taskId = event.pathParameters?.id;
    const { queryStringParameters: { action = null } = {} } = event || {};
    // Validation
    if (!taskId && !action) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task ID and action is required" }),
      };
    }

    const input = inputSchema.safeParse(action);
    if (!input.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid action" }),
      };
    }

    // Check if the task- exists
    const existingTask = await db
      .selectFrom("tasks")
      .select("id")
      .where("id", "=", taskId)
      .executeTakeFirst();

    if (existingTask) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Task not found" }),
      };
    }

    await db
      .insertInto("task_actions")
      .values({
        task_id: taskId,
        action: action as any,
        action_by: user_id,
      })
      .execute();

    return {
      statusCode: 201,
      body: JSON.stringify({}),
    };
  } catch (error) {
    console.error("Error action on task", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to record task action" }),
    };
  } finally {
    await db.destroy();
  }
};
