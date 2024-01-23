import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const taskId = event.pathParameters?.id;

    // Validation
    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task ID is required for deletion" }),
      };
    }

    await db.transaction().execute(async (trx) => {
      // Delete associated task categories
      await trx
        .deleteFrom("task_category")
        .where("task_id", "=", taskId)
        .execute();

      // Delete associated task images
      await trx
        .deleteFrom("task_images")
        .where("task_id", "=", taskId)
        .execute();

      // Finally, delete the task itself
      await trx.deleteFrom("tasks").where("id", "=", taskId).execute();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task successfully deleted" }),
    };
  } catch (error) {
    console.error("Error deleting task", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete task" }),
    };
  } finally {
    await db.destroy();
  }
};
