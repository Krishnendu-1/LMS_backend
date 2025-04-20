import mongoose from "mongoose";

const courseSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"course title is required"],
        trim:true,
        maxLength:[100,"title within 100 chars"]

    },
    subtitle:{
        type:String,
        trim:true,
        maxLength:[200,"sub title within 100 chars"]

    },
    description:{
        type:String,
        trim:true,
        minLength:[100,"description of minimum 100 chars"]

    },
    category:{
        type:String,
        required:[true,"course category is required"],
        trim:true,
    },
    level:{
        type:String,
        enum:{
            values:['beginner','intermediate','advanced'],
            message:"it is required"
        },
        default:'beginner'
    },
    price:{
        type:String,
        required:[true,"course title is required"],
        min:[0,'price must be non-negative']
    },
    thumbnail:{
        type:String,
        required:true
    },
    enrolledstudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Lecture'
        }
    ],
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,"instructor is required"]
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    totalDuration:{
        type:Number,
        default:0
    },
    totalLectures:{
        type:Number,
        default:0
    }

},
{timestamps:true,
    toJSON:true,//if we dont use those, virtuals will not be shown in response
    toObject:true
});

//middleware to calculate total lectures before saving
courseSchema.pre('save',function(next){
    if(this.lectures){
    this.totalLectures=this.lectures.length;
}

next()

})


courseSchema.virtual('totalEnrolledStudents').get(
    function(){
        return this.enrolledstudents.length;
    }
)

export const Course=mongoose.model("Course",courseSchema);