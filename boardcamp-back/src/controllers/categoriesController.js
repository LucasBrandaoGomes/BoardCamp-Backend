import connection from "../psql.js";
import Joi from "joi";

export async function PostCategory(req, res){

    const category = req.body;
    const categorySchema = Joi.object(
        {
          name: Joi.string().required()
        });
    const categoryValidation = categorySchema.validate(req.body)
    const {error} = categoryValidation

    if (error){
        const errorMsgs = error.details.map(err => err.message)
        res.status(422).send(errorMsgs)
        return;
    }
    try{
        await connection.query(`INSERT INTO categories (name) VALUES ('${category.name}')`)
        res.sendStatus(201);
    }catch (error){
        res.sendStatus(error);
    };
}

export async function GetCategories(req, res){

}