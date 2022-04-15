const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))


mongoose.connect("mongodb+srv://username:password@cluster0.h8ubd.mongodb.net/todolistDB?retryWrites=true&w=majority");


const itemSchema={name:String}
const listSchema={name:String,items:[itemSchema]}

const Item=mongoose.model("Item",itemSchema);
const List=mongoose.model("List",listSchema)

const item1= new Item({name:"welcome to todolist"})
const item2= new Item({name:"hit the + button to add a new item"})
const item3= new Item({name:"<-- Hit this to delete an item"})
const defaultItem=[item1,item2,item3]

app.get("/", function(req, res) {
  Item.find({},function(err,results){
    // console.log(results);
    if(results.length===0){
      Item.insertMany(defaultItem,function(err){
        if(err){
          console.log(err)
        } else{
          console.log("successfully save defaultitems")
          res.redirect("/")
        }
      })
    }else{
      res.render("list", {listTitle: "Today",newListItem: results})
    }
  })
});

app.get("/:custumListName",function(req,res){
  // console.log(req.params.custumListName);
  const custumListName=_.capitalize(req.params.custumListName);
  if(custumListName==="About"){
    res.render("about")
  }else{
  List.findOne({name:custumListName},function(err,foundlist){
    // console.log(foundlist)
    if(!err){
        if(!foundlist){
        const list=new List({
          name:custumListName,
          items:defaultItem
        })
        list.save();
        res.redirect("/"+custumListName)
      }else{
        res.render("list", {listTitle:foundlist.name ,newListItem:foundlist.items })
      }
    }
  })
}
})
app.post("/", function(req, res) {
  const enteredItem = req.body.newItem;
  const item =new Item({
    name:enteredItem
  });
  const listName=req.body.page;
  if(listName==="Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }
})
app.post("/delete",function(req,res){
  // console.log(req.body.toDeleteItem);
  const deleteItemId=req.body.toDeleteItem;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(deleteItemId, function(err){
      if(!err){
        console.log("item deleted successfully");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate(
      {name:listName},
      {$pull:{items:{_id:deleteItemId}}},
      function(err,foundlist){
        if(!err){res.redirect("/"+listName);}
      }
    )
  }
})

app.listen(process.env.PORT || 3000, function() {
  console.log("connected to server 3000");
})
