import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../utils/appstore";
import { removeUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { clearFeed } from "../utils/feedSlice";

const NavBar = () => {
    const user = useSelector((store: RootState) => store.user);
    const connectionRequest = useSelector((store: RootState) => store.connectionRequest);
    const connections = useSelector((store: RootState) => store.connections);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogOut = async () => {
        try {
            await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
            dispatch(removeUser());
            dispatch(clearFeed());
            return navigate("/login");
        } catch (err) {
            // Error logic maybe redirect to error page
            console.log(err);
        }
    };
    return (
        <div className="navbar bg-base-300 shadow-sm">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl">👨‍💻Dev Connect Tinder👨🏻‍💻</Link>
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
                            <Link to="/profile" className="justify-between">
                                Profile
                                {/* <span className="badge">New</span> */}
                            </Link>
                        </li>
                        <li><Link to="/connections">
                            <span>
                                Connection{" "}
                                {connections?.length > 0 && (
                                    <span className="badge badge-sm badge-secondary">
                                        {connections.length}
                                    </span>
                                )}
                            </span>
                        </Link></li>
                        <li><Link to="/connectionRequests">
                            <span>
                                Connection Requests{" "}
                                {connectionRequest?.length > 0 && (
                                    <span className="badge badge-sm badge-secondary">
                                        {connectionRequest.length}
                                    </span>
                                )}
                            </span>
                        </Link></li>
                        <li><a onClick={handleLogOut}>Logout</a></li>
                    </ul>
                </div>
            </div>
            }
        </div>
    )
}

export default NavBar