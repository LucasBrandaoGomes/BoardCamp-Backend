import connection from "../psql.js";
import Joi from "joi";

export async function PostCategory(req, res){

    const category = req.body;
    const categorySchema = Joi.object(
        {
          name: Joi.string().required()
        });
    const schemaValidation = categorySchema.validate(req.body)
    const {error} = schemaValidation

    if (error){
        const errorMsgs = error.details.map(err => err.message)
        res.status(422).send(errorMsgs)
        return;
    }
    try{
        await connection.query(`INSERT INTO categories (name) VALUES ($1)`, [category.name]);
        res.sendStatus(201);
    }catch (error){
        res.sendStatus(error);
    };
}

export async function GetCategories(req, res){
    try{
        const categoeries = await connection.query(`SELECT * FROM categories`)
        res.status(201).send(categoeries.rows);
    }catch (error){
        res.sendStatus(error);
    };
}