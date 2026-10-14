import axios from 'axios';
import { Outlet, useNavigate } from "react-router-dom"
import NavBar from "./NavBar"
import Footer from "./Footer";
import { BASE_URL } from "../utils/constants";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from "../utils/appstore";
import { addUser } from '../utils/userSlice';


const Body = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userData = useSelector((store: RootState) => store.user);

    const fetcUser = async () => {
        if (userData) return;
        try {
            const res = await axios.get(BASE_URL + "/profile/view", {
                withCredentials: true
            });
            dispatch(addUser(res.data));
            if (res.data) {
                navigate('/feed');
            }
        }

        catch (err: unknown) {
            if (axios.isAxiosError(err) && err?.status === 401) {
                navigate('/login');
                console.log(err.message);
            }
          }
    };

    useEffect(() => {
        fetcUser();
    }, []);
    return (
        <div>
            <NavBar />
            <Outlet />
            <Footer />
        </div>
    )
}

export default Body