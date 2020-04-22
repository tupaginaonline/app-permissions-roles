import dotenv from 'dotenv'
dotenv.config();

import mysql from 'mysql2/promise';


export  const connection = async():Promise<mysql.Connection> => {
	const conex = await mysql.createConnection({
		host:process.env.HOST,
		user:process.env.USER,
		password:process.env.PASSWORD,
		database:process.env.BD,
		connectionLimit:10
	});
	 return conex;

}
