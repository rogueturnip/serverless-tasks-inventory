import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/tasks";

import { db } from "@libs/database";
import { z } from "zod";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";
const user_id = "e2881cae-8d74-4ae3-9742-0693f54eba39";

const atLeastOneDefined = (obj: Record<string | number | symbol, unknown>) =>
  Object.values(obj).some((v) => v !== undefined);

const inputSchema = z
  .object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    schedule: z.string().optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
  })
  .refine(atLeastOneDefined, {
    message: "At least one field must be defined",
  });

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const taskId = event.pathParameters?.id;
    const { title, description, schedule, display_image, categoryIds } =
      JSON.parse(event.body);

    if (!taskId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task ID is required" }),
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

    const taskWithCategories = await db.transaction().execute(async (trx) => {
      // Update the task in the database
      await trx
        .updateTable("tasks")
        .set({
          title,
          description,
          schedule,
          display_image,
          modified_by: user_id,
          modified_at: new Date(),
        })
        .where("id", "=", taskId)
        .where("building_id", "=", building_id)
        .execute();

      // Then, insert new associations
      if (categoryIds && categoryIds?.length > 0) {
        // Update category associations in task_category table
        // First, delete existing associations

        await trx
          .deleteFrom("task_category")
          .where("task_id", "=", taskId)
          .execute();

        const taskCategoryEntries = categoryIds.map((categoryId) => ({
          task_id: taskId,
          category_id: categoryId,
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
        .select((eb) => [withCategories(eb), withImages(eb)])
        .where("t.id", "=", taskId)
        .executeTakeFirstOrThrow();
    });

    return {
      statusCode: 200,
      body: JSON.stringify(taskWithCategories),
    };
  } catch (error) {
    console.error("Error updating task", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update task" }),
    };
  } finally {
    await db.destroy();
  }
};
