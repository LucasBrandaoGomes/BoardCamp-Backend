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

    try{
        connection.query('SELECT * FROM rentals').then(rentals => {
        res.send(rentals.rows)});

        }catch (error){
          res.sendStatus(error)
        }      
}