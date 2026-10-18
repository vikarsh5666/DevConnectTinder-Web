import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import type { RootState } from "../utils/appstore";

const Body = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((store: RootState) => store.user);

    const fetchUser = async () => {
        if (userData) return;
        try {
            const res = await axios.get(BASE_URL + "/profile/view", {
                withCredentials: true,
            });
            dispatch(addUser(res.data));
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div>
            <NavBar />
            <main className="pt-16">
                <Outlet />
            </main>
            {/* <Outlet /> */}
            <Footer />
        </div>
    );
};
export default Body;