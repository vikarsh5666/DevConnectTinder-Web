import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { clearFeed } from "../utils/feedSlice";
import { clearConnections } from "../utils/connectionSlice";
import { clearRequests } from "../utils/connectionRequestsSlice";
import { removeUser } from "../utils/userSlice";
import { useAppDispatch, useAppSelector } from "../utils/hooks";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useAppSelector((store) => store.user);
  const connectionRequest = useAppSelector((store) => store.connectionRequest);
  const connections = useAppSelector((store) => store.connections);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogOut = async () => {
    try {
      await api.post("/logout");
      dispatch(removeUser());
      dispatch(clearFeed());
      dispatch(clearConnections());
      dispatch(clearRequests());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] navbar w-full bg-base-300 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xs">
          👨‍💻Dev Connect Tinder👨🏻‍💻
        </Link>
      </div>
      {user && (
        <div className="flex gap-2">
          <div className="form-control flex gap-4 items-center">
            Welcome, {user.firstName}
          </div>
          <div className="relative">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="w-10 rounded-full">
                <img alt="user photo" src={user.photoUrl}/>
              </div>
            </div>
            {isDropdownOpen && (
              <ul
                tabIndex={-1}
                className="menu menu-sm absolute right-0 top-full mt-3 w-52 rounded-box bg-base-100 p-2 shadow-lg z-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                <li>
                  <Link to="/profile" className="justify-between">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/connections">
                    <span>
                      Connection{" "}
                      {connections && connections.length > 0 && (
                        <span className="badge badge-sm badge-secondary">
                          {connections.length}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/connectionRequests">
                    <span>
                      Connection Requests{" "}
                      {connectionRequest.length > 0 && (
                        <span className="badge badge-sm badge-secondary">
                          {connectionRequest.length}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/premium">Premium</Link>
                </li>
                <li>
                  <button type="button" onClick={handleLogOut}>
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
