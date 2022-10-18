const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { capitalize } = require("lodash");

const app = express();

app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({extended :  true}));

app.use(express.static("public"))

mongoose.connect("mongodb+srv://pavankalyan:Test123@cluster0.nprqtha.mongodb.net/todolistDB",{useNewUrlParser : true});

const ItemsSchema = {
    name : String
};

const Item = mongoose.model("Item" , ItemsSchema);

const one = new Item({
    name : "Welcome to your todolist !"
});

const two = new Item({
    name : "Hit the + button to aff a new item. "
});

const three = new Item({
    name : "<-- Hit this to delete an item."
});

const defaultItems = [one,two,three];

const listSchema = {
    name : String,
    items : [ItemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){
    var today = new Date();
    var day = ""   
    var options ={
        weekday : "long",
        day : "numeric",
        month :"long"
    };

    var day = today.toLocaleDateString("en-US",options);

    Item.find({},function(err,found){
        if(found.length == 0){
		Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Task Done");
                }   
            });
            res.redirect("/");
        }else{
            res.render("list",{Listtitle : "Today" , newListItem : found});  
        }
          })
});

app.post("/",function(req,res){
        const itemName =  req.body.newItem;
        const listName = req.body.list;

        const item = new Item({
            name :itemName,
        });

        if(listName === "Today"){
            item.save();
            res.redirect("/");
        }else{
            List.findOne({name : listName},function(err,f){
                f.items.push(item);
                f.save();
                res.redirect("/" + listName);
            })
        }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Successfully deleted checked Item.");
                res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
  
})


app.get("/:customListName",function(req,res){
    //console.log(req.params.customListName);
    var nam = req.params.customListName;
    nam.capitalize;
    List.findOne({name: nam } , function(err,foundList){
        if(!err){
            if(!foundList){
                //console.log("No Exists");
                const list = new List({
                    name : req.params.customListName,
                    items : defaultItems
                });
            
                list.save();
                res.redirect("/" + req.params.customListName)

            }else{
                res.render("list",{Listtitle : foundList.name , newListItem : foundList.items})
            }
        }
    })
   
});

let port = process.env.PORT;
if(port==null||port == ""){
    port = 3000;
}

app.listen(port,function(){
    console.log("Server Started");
})
