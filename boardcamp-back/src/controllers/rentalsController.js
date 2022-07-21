import connection from "../psql.js";

export async function GetRentals(req, res){

    try{
        connection.query('SELECT * FROM rentals').then(rentals => {
        res.send(rentals.rows)});

        }catch (error){
          res.sendStatus(error)
        }      
}