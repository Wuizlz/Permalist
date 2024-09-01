import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Permalist",
  password: "Dabr0825_",
  port: 5433,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];
db.query("SELECT * FROM items ", (err, res) => {
  if (err) console.error("Error executing query", err.stack);
  items = res.rows;
});

app.get("/", async (req, res) => {
  try {
    const result = db.query("SELECT * FROM items ORDER BY id ASC ");
    items = (await result).rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    const result = await db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING *",
      [item]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error inserting item into the database", err.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit", async (req, res) => {
  const editId = req.body.updatedItemId;
  const newTitle = req.body.updatedItemTitle;
  try {
    console.log(editId);
    console.log(newTitle);
    const result = await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING *",
      [newTitle, editId]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error inserting item into the database", err.stack);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    console.log(id);
    const result = await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
