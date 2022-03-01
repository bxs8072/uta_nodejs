const express = require("express")
const app = express()

//cors
const cors = require("cors")
app.use(cors())

//body parser
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))



module.exports = app