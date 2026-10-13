import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState } from "../utils/appstore";
import { removeUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const NavBar = () => {
    const user = useSelector((store: RootState) => store.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogOut = async () => { 
        await axios.post(BASE_URL + '/logout' , 
            { withCredentials: true }) 
            dispatch(removeUser());
            return navigate('/login');
    };
    return (
        <div className="navbar bg-base-300 shadow-sm">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">👨‍💻Dev Connect Tinder👨🏻‍💻</a>
            </div>
            {user && <div className="flex gap-2">
                <div className="form-control flex gap-4 items-center">Welcome, {user.firstName}</div>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="user photo"
                                src={user.photoUrl} />
                        </div>
                    </div>
                    <ul
                        tabIndex={-1}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li>
                            <a className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a onClick={handleLogOut}>Logout</a></li>
                    </ul>
                </div>
            </div>
            }
        </div>
    )
}

export default NavBar