import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { withCategories } from "@libs/inventory";
import { z } from "zod";

const building_id = "f66e2ba8-ef76-45b7-a55b-91e469f6a659";
const user_id = "e2881cae-8d74-4ae3-9742-0693f54eba39";
// Assuming similar schema validation for inventory items
const inputSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  condition: z.enum(["new", "used", "poor", "fair", "good"]).optional(),
  current_price: z.number().positive().optional(),
  purchase_price: z.number().positive().optional(),
  purchase_location: z.string().optional(),
  quantity: z.number().positive().optional(),
  model_id: z.string().optional(),
  serial_number: z.string().optional(),
  brand_id: z.string().uuid().optional(),
  brand_other: z.string().optional(),
  warranty_expires_at: z.date().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  // Additional or different fields can be added here based on your inventory schema
});

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const {
      title,
      description,
      condition,
      current_value,
      purchase_price,
      purchase_location,
      quantity,
      model_id,
      serial_number,
      brand_id,
      brand_other,
      warranty_expires_at,
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

    const inventoryItemWithCategories = await db
      .transaction()
      .execute(async (trx) => {
        // Insert the inventory item into the database
        const inventoryItem = await trx
          .insertInto("inventory") // Adjust table name as necessary
          .values({
            title,
            description,
            condition,
            current_value,
            purchase_price,
            purchase_location,
            quantity,
            model_id,
            serial_number,
            brand_id,
            brand_other,
            warranty_expires_at,
            created_by: user_id,
            building_id,
            // Add other necessary fields here
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        if (categoryIds && categoryIds.length > 0) {
          const inventoryCategoryEntries = categoryIds.map(
            (categoryId: string) => ({
              inventory_id: inventoryItem.id,
              category_id: categoryId,
            })
          );

          await trx
            .insertInto("inventory_category") // Adjust table name and structure as necessary
            .values(inventoryCategoryEntries)
            .execute();
        }

        // Fetch the newly created inventory item with additional details
        // Adjust the following query to match how you want to fetch and display inventory items
        return await trx
          .selectFrom("inventory as i")
          .select([
            "i.id",
            "i.title",
            "i.description",
            // Add other necessary fields here
          ])
          .select((eb) => [withCategories(eb)])
          // If you have additional details or related data to fetch, adjust the query accordingly
          .where("i.id", "=", inventoryItem.id)
          .executeTakeFirstOrThrow();
      });

    return {
      statusCode: 201,
      body: JSON.stringify(inventoryItemWithCategories),
    };
  } catch (error) {
    console.error("Error handling inventory item", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to handle inventory item" }),
    };
  } finally {
    // await db.destroy();
  }
};
