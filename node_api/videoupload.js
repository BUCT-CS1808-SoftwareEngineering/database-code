var express = require("express");
var router = express.Router();
const multer = require('multer');
const fs = require('fs')

const app = express();

router.post('/upload',multer({
    dest:'upload'
}).single('file'),(req,res)=>{
    console.log(req.file);
    res.send(req.file)
})

app.use(router);
app.listen(3001)