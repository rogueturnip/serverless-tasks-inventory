import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  try {
    const inventoryId = event.pathParameters?.id;

    // Validation
    if (!inventoryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Inventory ID is required for deletion",
        }),
      };
    }

    await db.transaction().execute(async (trx) => {
      // Delete associated task categories
      await trx
        .deleteFrom("inventory_category")
        .where("inventory_id", "=", inventoryId)
        .execute();

      // Delete associated task images
      await trx
        .deleteFrom("inventory_images")
        .where("inventory_id", "=", inventoryId)
        .execute();

      // Finally, delete the task itself
      await trx.deleteFrom("inventory").where("id", "=", inventoryId).execute();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Inventory successfully deleted" }),
    };
  } catch (error) {
    console.error("Error deleting inventory", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete inventory" }),
    };
  } finally {
    await db.destroy();
  }
};
