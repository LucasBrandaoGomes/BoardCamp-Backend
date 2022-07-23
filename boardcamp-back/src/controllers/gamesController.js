import connection from "../psql.js";
import Joi from "joi";

export async function PostGames(req, res){
    
    const game = req.body;
    const gameSchema = Joi.object(
        {            
            name: Joi.string().required().min(1),
            image: Joi.string().dataUri(),
            stockTotal: Joi.number(),
            categoryId: Joi.number(),
            pricePerDay: Joi.number()    
              
        });

    const schemaValidation = gameSchema.validate(req.body)
    const { error } = schemaValidation
    if (error){
        const errorMsgs = error.details.map(err => err.message)
        res.status(422).send(errorMsgs)
        console.log("aqui")
        return;
    }

    try{
        // checando se a categoria existe
        {/*const checkCategory = await connection.query(`
        SELECT categories.*, games.* 
              FROM categories 
              JOIN games
              ON categories.id="games.categoryId" 
            WHERE "games.categoryId"=${game.categoryId}`)*/}

        const checkCategory = await connection.query(`
            SELECT name FROM categories WHERE id=${game.categoryId}`);

        // checando se o nome do jogo ja existe

        const checkGameName = await connection.query(`
            SELECT name FROM games WHERE name LIKE '%${game.name}%';
        `)
        if(checkCategory.rows[0]){
            if (!checkGameName.rows[0]){
                await connection.query(`INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ('${game.name}', '${game.image}', ${game.stockTotal}, ${game.categoryId}, ${game.pricePerDay})`)
                res.sendStatus(201)
            }else{
                res.sendStatus(409)
            }
        }else{
            res.sendStatus(400)
        }
    }catch (error){
        res.sendStatus(error);
    }
}

export async function GetGames(req, res){
    try{
        const games = await connection.query(`SELECT * FROM games`)
        res.status(201).send(games.rows);
    }catch (error){
        res.sendStatus(error);
    };
}