import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/inventory";

import { db } from "@libs/database";
import { z } from "zod";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";
const user_id = "e2881cae-8d74-4ae3-9742-0693f54eba39";

const atLeastOneDefined = (obj: Record<string | number | symbol, unknown>) =>
  Object.values(obj).some((v) => v !== undefined);

// Assuming similar schema validation for inventory items
const inputSchema = z
  .object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    // Additional or different fields can be added here based on your inventory schema
  })
  .refine(atLeastOneDefined, {
    message: "At least one field must be defined",
  });

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const inventoryId = event.pathParameters?.id;
    if (!inventoryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Inventory ID is required" }),
      };
    }

    const {
      title,
      description,
      categoryIds = [],
      // Add or remove fields as necessary
    } = JSON.parse(event.body);

    // Validate input
    const input = inputSchema.safeParse(JSON.parse(event.body));
    if (!input.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const updatedInventoryItem = await db.transaction().execute(async (trx) => {
      // Update the inventory item in the database
      await trx
        .updateTable("inventory")
        .set({
          title,
          description,
          modified_by: user_id,
          // Add other necessary fields here
        })
        .where("id", "=", inventoryId)
        .where("building_id", "=", building_id)
        .execute();

      // Update category associations
      // First, delete existing associations
      await trx
        .deleteFrom("inventory_category")
        .where("inventory_id", "=", inventoryId)
        .execute();

      // Then, insert new associations
      if (categoryIds && categoryIds.length > 0) {
        const inventoryCategoryEntries = categoryIds.map(
          (categoryId: string) => ({
            inventory_id: inventoryId,
            category_id: categoryId,
          })
        );

        await trx
          .insertInto("inventory_category")
          .values(inventoryCategoryEntries)
          .execute();
      }
      return await db
        .selectFrom("inventory as i")
        .select([
          "i.id",
          "i.title",
          "i.description",
          // Add other necessary fields here
        ])
        .select((eb) => [withCategories(eb), withImages(eb)])
        .where("i.id", "=", inventoryId)
        .executeTakeFirstOrThrow();
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedInventoryItem),
    };
  } catch (error) {
    console.error("Error updating inventory item", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update inventory item" }),
    };
  } finally {
    // await db.destroy();
  }
};
