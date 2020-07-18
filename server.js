const next = require("next");
const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;
const app = next({ dev });

const handle = app.getRequestHandler();
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: !dev,
    signed: true,
};

const authenticate = async (email, password) => {
    const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
    );

    return data.find((user) => {
        if (user.email === email && user.website === password) {
            return user;
        }
    });
};

app.prepare().then(() => {
    const server = express();

    server.use(express.json());
    server.use(cookieParser(process.env.COOKIE_SECRET));

    server.post("/api/login", async (req, res) => {
        const { email, password } = req.body;
        const user = await authenticate(email, password);
        if (!user) {
            console.log("Got here");
            return res.status(403).send("Invalid email or password");
        }

        const userData = {
            name: user.name,
            email: user.email,
            type: process.env.AUTH_USER_TYPE,
        };
        res.cookie("token", userData, COOKIE_OPTIONS);
        res.json(userData);
    });

    server.post("/api/logout", (req, res) => {
        res.clearCookie("token", COOKIE_OPTIONS);
        res.sendStatus(204);
    });

    server.get("/api/profile", async (req, res) => {
        const { signedCookies = {} } = req;
        const { token } = signedCookies;
        if (token && token.email) {
            const { data } = await axios.get(
                "https://jsonplaceholder.typicode.com/users"
            );
            const userProfile = data.find((user) => user.email === token.email);
            return res.json({ user: userProfile });
        }
        return res.sendStatus(404);
    });

    server.get("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`Listening on PORT ${PORT}`);
    });
});
