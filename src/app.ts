import express, {Application, Request, Response} from 'express'
import morgan from 'morgan'
import bcrypt from 'bcrypt'
import passport from 'passport'
import session from 'express-session'
import {connection} from './database'
import {IUser} from './interfaces'
import './config';

// Settings
const app = express()
app.set('port', process.env.PORT || 3000)

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

app.use(session({
	secret:`${process.env.SECRET}`,
	resave:false,
	saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session());


function authUser(req:Request,res:Response,next:Function){
	
	if(req.isAuthenticated()){
		return next();
	} 
	
	return res.status(401).send('Not allowed...');
}


function authRole(role:string){
	
	return (
	             (req:any,res:Response,next:Function) => {
					 
					 if(req.user.role==role){
						 return next();
					}
					 
					 return res.status(403).send('Unauthorized...');
				 }
	
	)
}

function getUsers(user:IUser,users:IUser[]){
	if (user.role === 'admin') return users
	return users.filter(u => u.id === user.id)
}

// Routes

app.get('/users', authUser, async(req:any,res:Response) => {
	
	try{
		const conn = await connection();
	       
		const [results] = await conn.query("select * from users");
			
		const users = JSON.parse(JSON.stringify(results));		
		  
	    return  res.json(getUsers(req.user, users));
		
	}catch(e){
		
		return res.status(500).send(e)
		
	}

});

app.get('/admin', authUser, authRole('admin'), (req,res) => {
	res.send('PANEL ADMIN');
})

app.get('/dashboard', authUser ,(req,res) => {
	res.send('Dashboard');
})


app.get('/',(req, res) => {
	res.send('Welcome to my App Permissions Roles')
});


app.delete('/logout', (req,res) => {
	req.logout();
	res.send('Log out successfully')
})

app.post('/signin', passport.authenticate("local",{
	successRedirect:'/',
	failureRedirect:'/login'
}));

app.post('/signup', async(req, res) => {
	
	const { email, password } = req.body;
	
	try{
		const conn = await connection();
	    const [result] = await conn.query("select * from users where email = ?",[email]);
		
		const user = JSON.parse(JSON.stringify(result));
		
		
		if(user.length>0){
			return res.status(400).send('The email already exist!!');
		}
		
		
		const hash = await bcrypt.hash(password,10);
		
		await conn.query("INSERT INTO users (email,password) values(?,?)", [email,hash]);
		
		return res.status(201).send("Created successfully");
		
		
	}catch(e){
		return res.status(500).send(e);
	}

});


export default app