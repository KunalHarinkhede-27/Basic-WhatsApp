const mongoose = require('mongoose');

const chat=require("./models/chat.js");

main()
.then(()=>{
    console.log("connection successfull");
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

let allchats=[
    {
        from:"rahul",
        to:"ketan",
        msg:"how are you",
        created_at:new Date(),
    },
    {
        from:"saurabh",
        to:"nakul",
        msg:"where are you",
        created_at:new Date(),
    },
    {
        from:"deepak",
        to:"yojit",
        msg:"hii bro",
        created_at:new Date(),
    },
    {
        from:"nikhil",
        to:"kunal",
        msg:"are you coming with me",
        created_at:new Date(),
    },
];
chat.insertMany(allchats);