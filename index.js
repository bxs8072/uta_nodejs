const dotenv = require("dotenv")

dotenv.config()
//database
const db = require("./database/db_connection")
db.connect()

const app = require("./app")

const authRouter = require("./routers/auth_router")
app.use("/", authRouter)


app.listen(process.env.PORT, () => { console.log("Server is running in port: " + process.env.PORT) })