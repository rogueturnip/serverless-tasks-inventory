import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";
import { withCategories, withImages } from "@libs/inventory";

import { db } from "@libs/database";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters } = event;
  const { order_by = "name" } = queryStringParameters || {};
  try {
    // Modify the query to join with building_spaces and group by space_id
    let query = db
      .selectFrom("inventory as i")
      .innerJoin("building_spaces as bs", "bs.id", "i.space_id")
      .select(["bs.id as space_id", "bs.name as space_name"])
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("inventory")
            .select(["id", "title", "description"])
            .select((eb) => [withCategories(eb), withImages(eb)])
            .whereRef("space_id", "=", "i.space_id")
            .limit(5)
        ).as("inventory"),
      ])
      .groupBy(["bs.name", "bs.id", "i.space_id", "i.id"]);

    switch (order_by) {
      case "name":
        query = query.orderBy("bs.name");
        break;
      default:
        query = query.orderBy("bs.name");
        break;
    }

    const inventoryBySpace = await query.execute();

    return {
      statusCode: 200,
      body: JSON.stringify(inventoryBySpace),
    };
  } catch (error) {
    console.error("Error fetching inventory by space", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get inventory by space" }),
    };
  }
};
