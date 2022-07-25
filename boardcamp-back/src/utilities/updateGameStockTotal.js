import connection from "../psql.js";

export async function updateGameStockTotal(id, rental) {
    const updateBy = rental ? -1 : 1;
    await connection.query(
      `
        UPDATE games SET "stockTotal" = "stockTotal" + ${updateBy} WHERE id = $1
      `,
      [id]
    );
  }