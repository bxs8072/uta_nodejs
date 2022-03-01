const Auth = require("../models/auth")

const loginVerifier = async (req, res, next) => {
    const { email } = req.body
    try {
        const auth = await Auth.findOne({ email })

        if (!auth) {
            return res.json({ message: "User does not existed with provided email address" })
        } else {
            next()
        }

    } catch (error) {
        return res.json({ message: "Something went wrong", error })
    }

}

module.exports = loginVerifier