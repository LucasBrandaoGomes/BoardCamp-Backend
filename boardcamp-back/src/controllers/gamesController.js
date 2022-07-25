import connection from "../psql.js";
import Joi from "joi";

export async function PostGames(req, res){
    
    const game = req.body;
    const gameSchema = Joi.object({
        name: Joi
            .string()
            .required(),
        image: Joi
            .string()
            .uri()
            .required(),
        stockTotal: Joi
            .number()
            .greater(0)
            .required(),
        categoryId: Joi
            .number()
            .greater(0)
            .required(),
        pricePerDay: Joi
            .number()
            .greater(0)
            .required()
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

        const checkCategory = await connection.query(`
            SELECT name FROM categories WHERE id=$1`, [game.categoryId]);

        // checando se o nome do jogo ja existe

        const checkGameName = await connection.query(`
            SELECT name FROM games WHERE name LIKE '%$1'`, [game.name]);
        
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
    const { gameName } = req.query;

    try{
        if (gameName){
            const {row : findGame } = await connection.query(`
            SELECT g.*, c.name as "categoryName"
            FROM games g
            JOIN categories c
            ON c.id=g."categoryId"
            WHERE g.name
            like $1
        `, [`${gameName}%`]);

        return res.send(findGame);
        };
        
        const games = await connection.query(`SELECT g.*, c.name AS "categoryName"
        FROM games g
        JOIN categories c
        ON c.id=g."categoryId"`)
        res.status(201).send(games.rows);
    }catch (error){
        res.sendStatus(error);
    };
}