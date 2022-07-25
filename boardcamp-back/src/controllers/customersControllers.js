import connection from "../psql.js";
import Joi from "joi";

export async function PostCustomers(req, res){

    const customer = req.body;
    
    const customerSchema = Joi.object({
        name: Joi
            .string()
            .required(),
        phone: Joi
            .string()
            .min(10)
            .max(11)
            .pattern(/^[0-9]+$/)
            .required(),
        cpf: Joi
            .string()
            .length(11)
            .pattern(/^[0-9]+$/)
            .required(),
        birthday: Joi
            .string()
            .length(10)
            .pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
            .required()
    });

    const schemaValidation = customerSchema.validate(req.body)
    const { error } = schemaValidation
    if (error){
        const errorMsgs = error.details.map(err => err.message)
        res.status(422).send(errorMsgs)
        return;
    }
    try{
        // checando se o cpf existe
        const checkCPF = await connection.query(`
            SELECT name, cpf FROM customers WHERE id=$1`, [customer.cpf]);
        if(!checkCPF.rows[0]){
            await connection.query(`INSERT INTO customers (name,phone,cpf,birthday) VALUES ('${customer.name}', '${customer.phone}', '${customer.cpf}', '${customer.birthday}')`)
            res.sendStatus(201);
        }else{
            res.sendStatus(409);
        }
    }catch (error){
        res.sendStatus(error);
    }
}

export async function GetCustomersById(req, res){
    const id = parseInt(req.params.id);
    try{
        const customer = await connection.query(`SELECT * FROM customers WHERE customers.id =$1`, [id])
        if (customer.rows[0]){
            res.status(201).send(customer.rows[0]);
        }else{
            res.sendStatus(404);
        }
    }catch (error){
        res.sendStatus(error);
    };
}

export async function GetCustomerByCPF(req, res){
    const { cpf } = req.query;
    
    try {
        if (cpf) {

            const { rows: customerByCPF } = await connection.query(`
                SELECT *
                FROM customers c
                WHERE c.cpf
                LIKE $1
            `, [`${cpf}%`]);

            return res.send(customerByCPF);
        };

        const { rows: customers } = await connection.query(`
            SELECT *
            FROM customers
        `);

        res.send(customers);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export async function UpdateCustomers(req, res){
    const id = parseInt(req.params.id);
    const customerUpdade = req.body;

    const customerUpdateSchema = Joi.object({
        name: Joi
            .string()
            .required(),
        phone: Joi
            .string()
            .min(10)
            .max(11)
            .pattern(/^[0-9]+$/)
            .required(),
        cpf: Joi
            .string()
            .length(11)
            .pattern(/^[0-9]+$/)
            .required(),
        birthday: Joi
            .string()
            .length(10)
            .pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
            .required()
    });

    const schemaValidation = customerUpdateSchema.validate(req.body)
    const { error } = schemaValidation
    if (error){
        const errorMsgs = error.details.map(err => err.message)
        res.status(422).send(errorMsgs)
        return;
    }

    try{
        const customer = await connection.query(`SELECT * FROM customers WHERE customers.id =$1`, [id])
        if (customer.rows[0]){
            await connection.query(`UPDATE customers SET name='$1', phone='$2', cpf='$3', birthday='$4 WHERE id = $5`, [customerUpdade.name, customerUpdade.phone, customerUpdade.cpf, customerUpdade.birthday, id]);
        }else{
            res.sendStatus(409)
        }
    }catch (error){
        res.sendStatus(error)
    }

}
