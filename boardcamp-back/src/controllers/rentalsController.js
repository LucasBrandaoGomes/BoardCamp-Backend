import connection from "../psql.js";
import dayjs from 'dayjs';
import { updateGameStockTotal } from "../utilities/updateGameStockTotal.js";
import Joi from "joi";

export async function PostRentals(req, res){

    const { customerId, gameId, daysRented } = req.body;

    const newRentalSchema = Joi.object({
      customerId: Joi.number().required(),
      gameId: Joi.number().required(),
      daysRented: Joi.number().greater(0).required(),
    });

    const schemaValidation = newRentalSchema.validate(req.body)
      const { error } = schemaValidation
      if (error){
          const errorMsgs = error.details.map(err => err.message)
          res.status(422).send(errorMsgs)
          return;
      }
    
    // verificação de usuário

    const checkCPF = await connection.query(`
            SELECT name, cpf FROM customers WHERE id=$1`, [customerId]);
      if(!checkCPF.rows[0]){
            res.status(400).send("Usuário não existente");
            return;
      }

    //verificação de game existente
    const checkGame = await connection.query(`
    SELECT name FROM games WHERE id=$1`, [gameId]);
      if(!checkGame.rows[0]){
        res.status(400).send("Jogo não existe");
        return;
      }
    
    // verificando dia aluados

    if (daysRented <= 0){
      res.sendStatus(400)
      return;
    }

    // verificando quantidade em estoque

    if (checkGame.stockTotal === 0) {
      res.status(400).send('Esse jogo não está disponível para aluguel!');
    }

    const currentDate = dayjs().format('YYYY-MM-DD');

    // preço
    const { rows } = await connection.query(
      `
        SELECT games."pricePerDay" FROM games WHERE games.id = $1
      `,
      [gameId]
    );
    const gamePrice  = rows[0].pricePerDay;
    const originalPrice = gamePrice * daysRented;
    
    try{
      await connection.query(
        `
          INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
          VALUES ($1, $2, $3, $4, NULL, $5, NULL)
        `,
        [customerId, gameId, currentDate, daysRented, originalPrice]
      );

      await updateGameStockTotal(gameId, true);
      res.sendStatus(201);
  } catch (error) {
    res.sendStatus(error);
  }

}

export async function GetRentals(req, res){

  const { customerId, gameId } = req.query;
  // criano uma query generica 
  let genericQuery = `
  SELECT rentals.*, customers.name AS "customerName",
  games.name AS "gameName",
  games."categoryId",
  categories.name AS "categoryName" FROM rentals
  JOIN customers
  ON customers.id = rentals."customerId"
  JOIN games
  ON games.id = rentals."gameId"
  JOIN categories
  ON games."categoryId" = categories.id
`;
  //modificando as queries para caso eja passado customerId ou gameId, ou ambos

  if (customerId && gameId) {
    genericQuery += ` WHERE (rentals."customerId" = ${customerId} AND rentals."gameId" = ${gameId})`;
  } else if (customerId) {
    genericQuery += ` WHERE rentals."customerId" = ${customerId}`;
  } else if (gameId) {
    genericQuery += ` WHERE rentals."gameId" = ${gameId}`;
  }

  try {
    const { rows : rentals } = await connection.query(genericQuery)
    const rentalObjectSend = rentals.map((rental) => (   
      {
        id: rental.id,
        customerId: rental.customerId,
        gameId: rental.gameId,
        rentDate: rental.rentDate,
        daysRented: rental.daysRented,
        returnDate: rental.returnDate,
        originalPrice: rental.originalPrice,
        delayFee: rental.delayFee,
        customer: {
         id: rental.customerId,
         name: rental.customerName
        },
        game: {
          id: rental.gameId,
          name: rental.gameName,
          categoryId: rental.categoryId,
          categoryName: rental.categoryName
        }
      })
    );
    res.send(rentalObjectSend);
  } catch (error) {
    res.sendStatus(error);
  }
}

export async function EndRental(req, res){
  const { id } = req.params;

  const rental = await connection.query(
    `
      SELECT * FROM rentals 
      WHERE id = $1
    `,
    [id]
  );

   // preço por dia do jogo alugado 
   const { rows } = await connection.query(
    `
      SELECT games."pricePerDay" FROM games WHERE games.id = $1
    `,
    [rental.rows[0].gameId]
  );
  // verificação se existe o aluguel
  if (!rental){
    res.sendStatus(404)
    return;
  }

  //verificação se o aluguel ja foi finalizado

  if(rental.rows[0].returnDate !== null){
    res.status(400).send("Aluguel já finalizado")
    return;
  }

  async function calculateDelayFee(rental){

    const oneDayMiliseconds = 1000 * 60 * 60 * 24;
    const aux = dayjs().format('YYYY-MM-DD');
    const currentDate = dayjs(aux)
    const rentDate = dayjs(rental.rows[0].rentDate);
    const delay = currentDate.diff(rentDate);

    if (delay > 0) {
      const gamePrice  = rows[0].pricePerDay;
      const price = (delay / oneDayMiliseconds) * gamePrice
      return price
    }
    return 0;
  }

  try {
  
    const currentDate = dayjs().format('YYYY-MM-DD');
    const delayFee =  await calculateDelayFee(rental);

    await connection.query(
      `
        UPDATE rentals SET ("returnDate", "delayFee") = ($1, $2)
        WHERE id = $3
      `,
      [currentDate, delayFee, id]
    );

    await updateGameStockTotal(rental.gameId, false);
    res.sendStatus(200);

  } catch (error) {
    res.sendStatus(error);
  }
}

export async function DeleteRental(req, res){
  const { id } = req.params;

  const rental = await connection.query(
    `
      SELECT * FROM rentals 
      WHERE id = $1
    `,
    [id]
  );

  // verificação se existe o aluguel
  if (!rental){
    res.sendStatus(404)
    return;
  }

  if(rental.rows[0].returnDate === null){
    res.status(400).send("Aluguel não finalizado")
    return;
  }

  try {
      await connection.query(
        `
          DELETE FROM rentals 
          WHERE id = $1
        `,
        [id]
      );
      res.sendStatus(200);    
    } catch (error) {
      res.sendStatus(error);
    }
  }
