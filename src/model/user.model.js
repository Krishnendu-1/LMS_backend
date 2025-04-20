import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
        maxLength:[60,"name exceeds limit"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique:true,
        maxLength:[40,"email exceeds limit"],
        match:[/^[a-zA-Z0-9. _%+-]+@[a-zA-Z0-9]/,"enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your email"],
        minLength:[6,"password should be atleast 6 characters"],
        maxLength:[30,"password exceeds limit"],
        select:false,

    },
    role:{
        type:String,
        enum:{
            values:["student","instructor","admin"],
            message:"please select correct role",
        },
        default:"student",
    },
    avatar:{
        type:String,
        default:'default-avatar.png'
    },
    bio:{
        type:String,
        maxLength:[200,"bio exceeds limit"],
        default:"Hey it's me!",
    },
    enrolledCourses:[
        {
            course:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
            },
            enrolledAt:{
                type:Date,
                default:Date.now,
            }
        },
    ],
    createdCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ],
    resetPasswordToken:String,
    resetPasswordExpire:Date,

},
{ 
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}

});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password= await bcrypt.hash(this.password,12);
    next();//next() is used in middlewares only to pass control to the next function...but normal funtion doesnot need next()
});
userSchema.methods.comparePassword=async function (enteredPassword) {
    await bcrypt.compare(enteredPassword,this.password)
    
}

userSchema.methods.getResetPasswordToken= function () {
    const resetToken=crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    this.resetPasswordExpire=Date.now()+5*60*1000//5 min
    return resetToken;
    
}

//virtuals **
userSchema.virtuals("totalEnrolledCourses").get(
    function(){
        return this.enrolledCourses.length;
    }
)


export const User= mongoose.model("User",userSchema);