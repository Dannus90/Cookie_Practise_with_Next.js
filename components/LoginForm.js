import React, { useState } from "react";
import { loginUser } from "../lib/auth";
import Router from "next/router";

const LoginForm = () => {
    const [email, setEmail] = useState("Sincere@april.biz");
    const [password, setPassword] = useState("hildegard.org");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === "email") {
            setEmail(e.target.value);
        }

        if (e.target.name === "password") {
            setPassword(e.target.value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        loginUser(email, password)
            .then(() => {
                Router.push("/profile");
                setIsLoading(false);
            })
            .catch(showError);
    };

    const showError = (err) => {
        console.error(err);
        const error = (err.response && err.response.data) || err.message;
        setError(error);
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleChange}
                />
            </div>
            <div>
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={password}
                    onChange={handleChange}
                />
            </div>
            <button disabled={isLoading} type="submit">
                {isLoading ? "Sending" : "Submit"}
            </button>
            {error && <div>{error}</div>}
        </form>
    );
};

export default LoginForm;
