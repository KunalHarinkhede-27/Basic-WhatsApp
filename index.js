const express=require("express");
const app=express();
const path=require("path");
const chat=require("./models/chat.js");
const expresserror=require("./expresserror");

const mongoose = require('mongoose');
const port=8080;

main()
.then(()=>{
    console.log("connection successfull");
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

app.set("view engiene","ejs");
app.set("views",path.join(__dirname,"/views"));

app.use(express.static(path.join(__dirname,"/public/css")));

const methodoverride=require("method-override");

app.use(express.urlencoded({extended:true}));
app.use(methodoverride('_method')); 

// let chat1=new chat({
//     from:"kunal",
//     to:"saurabh",
//     msg:"come fast to complete work.",
//     created_at:new Date(),
// });

// chat1.save()
// .then((res)=>{
//     console.log(res);
// })
// .catch((err)=>{
//     console.log(err);
// })

app.listen(port,()=>{
  console.log(`server is listening to port ${port} `);
});

app.get("/",(req,res)=>{
    res.send("server working");
});

app.get("/chats", async(req,res)=>{
    let chats=await chat.find();
    //console.log(chats);
    res.render("index.ejs",{chats});
})

app.get("/chats/create",(req,res)=>{
    res.render("create.ejs");
})

app.post("/chats",asyncwrap(async(req,res,next)=>{
    let {from,msg,to}=req.body;
    let newchat=new chat({
        from:from,
        msg:msg,
        to:to,
        created_at:new Date(),
    });
    await newchat.save()
    res.redirect("/chats");
}));

app.post("/chats/create1",asyncwrap(async(req,res,next)=>{
    let {from}=req.body;
    console.log(from);
    res.redirect("/chats");
}));

app.delete("/chats/:id",async (req,res)=>{
    let {id}=req.params;
    let deletedchat=await chat.findByIdAndDelete(id);
    console.log("deleted chat is",deletedchat);
    res.redirect("/chats");
});

app.get("/chats/:id/update",asyncwrap(async(req,res,next)=>{
    let {id}=req.params;
    let updatechat=await chat.findById(id);
    res.render("update.ejs",{updatechat});
}));

app.patch("/chats/:id",asyncwrap(async(req,res,next)=>{
    let {id}=req.params;
    let {msg:newmsg}=req.body; 
    console.log(newmsg);
    let updatedchat=await chat.findByIdAndUpdate(id,{msg:newmsg},{runValidators:true, new:true});
    res.redirect("/chats");
}));

/*here we are creating such type of function in which a function is returned and inside this function another function
is catching the error. This function we use in all operations. This is the professional way to deal with the express errors.*/

function asyncwrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    };
}
//show route
app.get("/chats/:id",asyncwrap(async(req,res,next)=>{
    let {id}=req.params;
    let chatdetails=await chat.findById(id);
    if(!chatdetails){
    next(new expresserror(404,"chat not found"));
    }
    res.render("show.ejs",{chatdetails});

}))

//this are the functions which get called in the following error handling middleware
const handlevalidationerror=(err)=>{
    console.log("this is validation error");
    console.dir(err.message);
    return err;
}

const handlecasterror=(err)=>{
    console.log("this is cast error");
    console.dir(err.message);
    return err;
}

/*this middleware is created for the purpose of passing different functions according to type of error which is 
arising in our program and by which our site will get crashed.*/
app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err.name==="ValidationError"){
        err=handlevalidationerror(err);
    }
    else if(err.name="CastError"){
        err=handlecasterror(err);
    }
    next(err);
})

//error handling middleware function
app.use((err,req,res,next)=>{
    let {status=500,message="some error is occured"}=err;
    res.status(status).send(message);
});

/*to define our middleware we have to create an error class in which we have to decclare what we are trying to show 
on our page as a error. then in our program we have to require it. Then after for using this in our js file we 
have to create a error handling middleware. then in our code we have to use it.In normal arrow funcction we have to
throw the error. and in case of async function we have to pass it in the next.For applying it to multiple function 
we have to take whole code in the try block and then catch the error.*/