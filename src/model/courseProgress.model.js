import mongoose from "mongoose";

const lectureProgressSchema=new mongoose.Schema(
    {
        lecture:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Lecture',
            required:true
        },
        isCompleted:{
            type:Boolean,
            default:false
        },
        watchTime:{
            type:Number,
            default:0,
        },
        lastwatched:{
            type:Date,
            default:Date.now //not executing...just referencing
        }

    },
    {
        timestamps:true
    }
)


const courseProgresssSchema=new mongoose.Schema(
    {
        course:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course',
            required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true

        },
        isCompleted:{
            type:Boolean,
            default:false
        },
        completionPercentage:{
            type:Number,
            default:0,
            min:0,
            max:100
        },
        lectureProgress:[lectureProgressSchema],
        lastAccessed:{
            type:Date,
            default:Date.now
        }


    },
    {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}

    }

)


courseProgresssSchema.pre('save',function(next){
    if(this.lectureProgress.length>0){
        const courseProgress=this.lectureProgress.filter(lp=>lp.isCompleted).length
        this.completionPercentage=Math.round((courseProgress/this.lectureProgress.length)*100) //lectureProgess is a whole document counting as 1 as whole. So if 4 lectures completed and if there are 10 total lectures, then 10/4 *100
        this.isCompleted=this.completionPercentage===100//returns true or false
    }

    next();
})

courseProgresssSchema.pre('save',function(next){
    this.lastAccessed=Date.now();
    next();
})


export const CourseProgress=mongoose.model('CourseProgress',courseProgresssSchema)