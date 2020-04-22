import passport from 'passport';
import {Strategy}  from 'passport-local';
import {connection} from './database';
import bcrypt from 'bcrypt';
import {IUser} from './interfaces'

async function authenticateUser(email:string,password:string,done:Function){
	
	try{
		const conn = await connection();

		const [result] = await conn.query("SELECT * from users where email=?",[email]);
        
		const user = JSON.parse(JSON.stringify(result));
		
        if(user.length==0){
			return done(null,false);
		}

            //compare password
			if(await bcrypt.compare(password,user[0].password)){
				return done(null,user[0]);
			}
				return done(null,false);
	}
	catch(e){
		return done(null,false);
	}
 
};



passport.use(new Strategy({usernameField:'email'}, authenticateUser));

passport.serializeUser( (user:IUser,done) => {
	done(null,user.id);
})

passport.deserializeUser( async(id,done) => {
	
	try{
		const conn = await connection();

		const [result] = await conn.query("SELECT * from users where id=?",[id]);
		
		const user = JSON.parse(JSON.stringify(result));
		
        if(user.length==0){
			return done(null,false);
		}
		
		return done(null,user[0]);
		
	}
	catch(e){
		return done(null,false);
	}
		
	
})