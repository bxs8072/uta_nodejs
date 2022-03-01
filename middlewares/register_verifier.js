const Auth = require("../models/auth")

const registerVerifier = async (req, res, next) => {
    const { email } = req.body
    try {
        const auth = await Auth.findOne({ email })

        if (auth) {
            return res.status(401).send("User already existed with provided email address")
        }

    } catch (error) {
        return res.status(401).send("Something went wrong")
    }

    next()
}

module.exports = registerVerifier