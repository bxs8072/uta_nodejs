const jwt = require('jsonwebtoken')


const authVerifier = async (req, res, next) => {

    try {
        if (!req.headers.authorization) throw "No authorization"
        let token = req.headers.authorization
        token = token.trim()
        const payload = await jwt.verify(token, process.env.TOKEN_SECRET)
        req.payload = payload
        next()

    } catch (err) {
        console.log(err)

        res.status(403).json({
            error: true,
            message: "You need to login to perform this action",
        })
    }

}

module.exports = authVerifier