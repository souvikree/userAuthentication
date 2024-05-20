const mongoose = require('mongoose');
const db = process.env.DB;
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connection Succesfull");
}).catch((err) => {
    console.log(err);
});