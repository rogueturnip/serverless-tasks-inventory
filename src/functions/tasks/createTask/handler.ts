import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { withCategories } from "@libs/tasks";
import { z } from "zod";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";
const user_id = "e2881cae-8d74-4ae3-9742-0693f54eba39";

const inputSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  schedule: z.string().optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const {
      title,
      description,
      schedule,
      category_ids = [],
    } = JSON.parse(event.body);

    // Validate input
    const input = inputSchema.safeParse(JSON.parse(event.body));
    if (!input.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const taskWithCategories = await db.transaction().execute(async (trx) => {
      // Insert the task into the database
      const task = await trx
        .insertInto("tasks")
        .values({
          title,
          description,
          schedule,
          building_id,
          created_by: user_id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Insert category associations in task_category table
      if (category_ids && category_ids.length > 0) {
        const taskCategoryEntries = category_ids.map((category_id: string) => ({
          task_id: task.id,
          category_id: category_id,
        }));

        await trx
          .insertInto("task_category")
          .values(taskCategoryEntries)
          .execute();
      }

      // Fetch the newly created task with its categories
      return await trx
        .selectFrom("tasks as t")
        .select([
          "t.id",
          "t.title",
          "t.description",
          "t.schedule",
          "t.created_at",
        ])
        .select((eb) => [withCategories(eb)])
        .where("t.id", "=", task.id)
        .executeTakeFirstOrThrow();
    });

    return {
      statusCode: 201,
      body: JSON.stringify(taskWithCategories),
    };
  } catch (error) {
    console.error("Error creating task", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create task" }),
    };
  } finally {
    await db.destroy();
  }
};
