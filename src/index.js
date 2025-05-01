import express from 'express'
import { configDotenv } from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import ExpressMongoSanitize from 'express-mongo-sanitize';
import healthCheckRoute from './routes/healthCheck.route.js';
const app=express();
configDotenv();

//global rate limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
    message:"too many requests, try again after some time"
})


//security middleware
app.use(helmet());
app.use('/api',limiter)// Apply the rate limiting middleware to all requests where /api is present
app.use(hpp())
app.use(ExpressMongoSanitize());
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,

}))


//logging status in terminal on each log
if(process.env.NODE_ENV==='development')
    app.use(morgan('dev'));

//testing server
app.get('/',(req,res)=>{
    res.send("server working fine");
})
app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT} for ${process.env.NODE_ENV}`);
})


//body parser middleware
app.use(express.json({limit:'15kb'}))
app.use(express.urlencoded({extended:true,limit:'15kb'}))

//global error handling
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(err.status).json({
        status:'error',
        message:"internal server problem",
        ...(process.env.NODE_ENV==="development" && {stack:err.stack})//spread the stack if both true
    })
})

//API routes
app.use('/health',healthCheckRoute)


//global 404 error handler--->KEEP IT IN BOTTOM
app.use((req,res)=>{
    res.status(404).json({
        status:"errr",
        message:"route not found"

    })
})