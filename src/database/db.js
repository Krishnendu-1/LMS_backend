import mongoose, { mongo, Promise } from "mongoose";

//Global variables
const MAX_RETRIES=3;
const RETRY_INTERVAL=6000;//6 sec time is required to reconnect

class DatabaseConnection{

    constructor(){
        this.retryCount=0
        this.isConnected=false
        
        mongoose.set('strictQuery',true)

        mongoose.connection.on('connected',()=>{
            console.log('connected successfully');
            this.isConnected=true
        })
        mongoose.connection.on('disconnected',()=>{
            console.log('disconnected successfully');
            this.handleDisconnectionError()
        })
        mongoose.connection.on('error',()=>{
            console.log('error in connecting');
        })

        process.on('SIGTERM',this.handleAppTermination.bind(this))//we cant directly call outside method in constructor , so we use "bind()" to pass the instance of the function using "this"
    }

    async connect(){
        try {
            if(!process.env.MONGODB_URI) throw new Error('Mongo URI variable is not defined');
    
            const connectionOptions={
                useNewUrlParser:true,
                useUnifiedTopology:true,
                maxPoolSize:10,
                serverSelectionTimeoutMS:5000,
                socketTimeoutMS:45000,
                family:4//ipv4
            }
            
            await mongoose.connect(process.env.MONGODB_URI,connectionOptions);
            this.retryCount=0;
            this.isConnected=true;
        } catch (error) {
            console.log(error.message);
            await this.handleConnectionError();
        }
}

    async handleConnectionError() {
        if(this.retryCount<MAX_RETRIES){
            this.retryCount++;
            console.log(`reconnecting....ATTEMPT${this.retryCount} out of ${MAX_RETRIES}`);
            await new Promise((resolve,reject)=>setTimeout(()=>{
                resolve
            },RETRY_INTERVAL))//wait for 6sec without doing anything
            return this.connect();
        }else{
            console.log('you have exceeded max retries');
        }
        
    }

    async handleDisconnectionError() {
        if(!this.isConnected) {
        console.log('trying to reconnect');
        this.connect()
        }
        
    }

    async handleAppTermination(){
        try{
            await mongoose.connection.close()
            console.log("connection closed properly")
        }catch{
            console.log('error during app termiation');
            process.exit(1);
        }
    }



    getDetails() {
        return {
            isConnected:this.isConnected,
            readyState:mongoose.connection.readyState,
            host:mongoose.connection.host,
            name:mongoose.connection.name
        }
        
    }
}



//create singleton instance
const dbconnect=new DatabaseConnection();

export default dbconnect.connect.bind(dbconnect);//if forgot search for it...this is important to know
export const getDBstatus=dbconnect.getDetails.bind(dbconnect);