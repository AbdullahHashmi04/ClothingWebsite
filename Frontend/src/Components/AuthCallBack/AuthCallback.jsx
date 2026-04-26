// src/pages/AuthCallback.jsx
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from '../Context/CartContext.jsx'
import axios from "axios";

const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");

const AuthCallback = () => {
    const navigate = useNavigate();
    const { SetRegisterStatus, setLoginStatus, setUserInfo } = useContext(CartContext)

    useEffect(() => {
        const handleGoogleLogin = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            if (!token) {
                return navigate("/login");
            }
            localStorage.setItem("token", token);
            axios.get(`${BACKEND_URI}/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => {
                    console.log(res.data.user);
                    setUserInfo(res.data.user)
                    navigate("/");
                })
                .catch(() => {
                    console.log("Not till found")
                    navigate("/login");
                })
            setLoginStatus(true)
            SetRegisterStatus(true)
        };

        handleGoogleLogin();
    }, [navigate]);

    return <p>Logging you in...</p>;
};

export default AuthCallback;