const router = require("express").Router()
const Auth = require("../models/auth")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


//validator and middleware
const { check, validationResult } = require('express-validator')
const registerVerifier = require("../middlewares/register_verifier")
const loginVerifier = require("../middlewares/login_verifier")

//---> Register new user with email and password
router.post('/register', registerVerifier, [
    // Authname must be an email
    check('email').isEmail().withMessage(
        "Invalid email address"
    ),

    check('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
        .withMessage("Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character. "),
],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({ error: errors.array()[0].msg, param: errors.array()[0].param });
        }

        const { email, password } = req.body

        const saltRound = 10
        //Hashing password
        const hashedPassword = await bcrypt.hash(password, saltRound)

        try {
            //Create Auth In Database
            const auth = new Auth({ email, password: hashedPassword })

            await auth.save()

            const getAuth = await Auth.findOne({ email }).lean()

            const token = jwt.sign(getAuth, process.env.TOKEN_SECRET)


            const activationLink = process.env.APPURL + "/auth/activate/" + token


            return res.status(200).json({
                message: "Successfully created account. Please check you email to activate your account!",
                link: activationLink
            })

        } catch (error) {
            return res.status(401).send(error)
        }

    })

//---> Activate account for new registered user
router.get('/activate/:token', async (req, res, next) => {
    const token = req.params.token

    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.json({ message: "Incorrect or expired link", err })
            }

            const { email } = decodedToken

            try {
                await Auth.findOneAndUpdate({ email }, { isVerified: true })

                return res.json({ message: "Successfully activated account", data: decodedToken })

            } catch (error) {
                return res.json({ message: "Something went wrong", error })
            }
        })
    }
})

//---> Login with email and password
router.post('/login', loginVerifier, async (req, res, next) => {
    const { email, password } = req.body
    console.log(req.body)

    const auth = await Auth.findOne({ email }).lean()

    const passwordMatched = await bcrypt.compare(password, auth.password)

    if (!passwordMatched) {
        return res.status(401).send("Invalid Email or Password. Try again")
    }

    const token = jwt.sign(auth, process.env.TOKEN_SECRET)

    return res.status(200).header("auth-token", token)
        .json({
            message: "Successfully logged in",
            token,
            data: auth,
        })
})

//---> forgot password
router.post('/forgot-password', loginVerifier, async (req, res) => {
    const { email } = req.body

    const auth = await Auth.findOne({ email })

    const token = jwt.sign(auth._id, process.env.RESET_PASSWORD_SECRET, { expiresIn: "20m" })

    const link = "http://localhost:7777/auth/forgot-password" + token
    return res.json({ message: "Click on the link to reset your password", link })

})

//---> change password
router.post('/forgot-password/:token', async (req, res, next) => {
    const token = req.params.token
    const { password } = req.body

    const saltRound = 10
    //Hashing password
    const hashedPassword = await bcrypt.hash(password, saltRound)

    if (token) {
        jwt.verify(token, process.env.RESET_PASSWORD_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.json({ message: "Incorrect or expired link", err })
            }

            const { email } = decodedToken

            try {
                await Auth.findOneAndUpdate({ email }, { password: hashedPassword })

                return res.json({ message: "Successfully changed password" })

            } catch (error) {
                return res.json({ message: "Something went wrong", error })
            }
        })
    }
})


module.exports = router