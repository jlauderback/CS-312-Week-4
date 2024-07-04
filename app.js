const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jwl235:pnW7sEC2tg7lzVZ6@cluster0.gi5govy.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item ({
  name: "Buy Food",
});

const item2 = new Item ({
  name: "Cook Food",
});

const item3 = new Item ({
  name: "Eat Food",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model(
  "List",
  listSchema
);

app.set('view engine', 'ejs');

app.get("/", async function(req, res){
  let foundItems = await Item.find({});
  if(foundItems.length === 0){
    Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render('list', {listTitle: "Today", newListItems: foundItems});
  }
});

app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today"){
    await item.save();
    res.redirect("/");
  } else {
    const foundList = await List.findOne({name: listName});
    foundList.items.push(item);
    await foundList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    await Item.findByIdAndDelete(checkedItemId);
    res.redirect("/");
  } else {
    const foundList = await List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}}
    );
    res.redirect("/" + listName);
  }
});

app.get("/:customListName", async function (req, res){
  const customListName = _.capitalize(req.params.customListName);
  const foundList =  await List.findOne({name: customListName});
  if (!foundList){
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    await list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}
app.listen(port, function(){
  console.log("server started")
});
