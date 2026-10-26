import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../utils/appstore";
import { addConnections } from "../utils/connectionSlice";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";

interface Connection {
  _id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}


const Connections = () => {
  const [isOpenConnectionProfile, setIsOpenConnectionProfile] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState();
  const navigate = useNavigate();

  const connections = useSelector((store: RootState) => store.connections);
  const dispatch = useDispatch();
  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data));
    } catch (err) {
      // Handle Error Case
      console.error(err);
    }
  };

  const handleChatClick = (connection: any) => {
    navigate(`/chat/${connection._id}`, {
      state: {
        photoUrl: connection.photoUrl,
      },
    });
  };

  useEffect(() => {
    fetchConnections();
  }, []);
  if (!connections) return;

  if (connections.length === 0) return <h1> No Connections Found</h1>;
  const handleDivClick = (connection: any) => {
    console.log('ddsfdfds');
    setIsOpenConnectionProfile(true);
    setSelectedConnectionId(connection._id);
  };

  const selectedConnection = isOpenConnectionProfile && connections.find(
    (connection: Connection) => connection._id === selectedConnectionId
  );


  return (
    <div className="text-center my-10">
      {/* <h1 className="text-bold text-white text-3xl">Connections</h1> */}
      <span className="text-bold text-white text-3xl">
        Connections <div className="badge badge-sm badge-secondary">{connections.length}</div>
      </span>

      {connections.map((connection: any) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          connection;
        return (
          <div
            key={_id}
            className="flex items-center m-4 p-4 rounded-lg bg-base-300 w-full max-w-3xl mx-auto"
            onClick={() => handleDivClick(connection)}
          >
            <div>
              <img
                alt="photo"
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
              />
            </div>
            <div className="text-left mx-4 flex-1">
              <h2 className="font-bold text-xl text-yellow-300">
                {firstName + " " + lastName}
              </h2>
              {age && gender && <p>{age + ", " + gender}</p>}
              <p>{about}</p>
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChatClick(connection);
                }}

                className="btn btn-primary shrink-0 ml-auto">Chat</button>
            </div>
          </div>
        );
      })}

      <>
        <div>
          {/* Your existing connection card */}
        </div>

        {isOpenConnectionProfile && (
          <dialog
            id="my_modal_1"
            className="modal"
            open
          >
            <div className="modal-box relative">
              <button
                onClick={() => setIsOpenConnectionProfile(false)}
                aria-label="Close profile"
                className="btn btn-circle btn-sm absolute right-3 top-18 z-10
             bg-base-100 text-base-content
             border-2 border-white/70
             shadow-lg
             hover:bg-primary hover:text-primary-content
             hover:border-primary
             transition-all duration-200"
              >
                <span className="text-lg font-bold">✕</span>
              </button>

              <UserCard
                user={selectedConnection}
                isHideActionBtn={true}
              />
            </div>
          </dialog>
        )}
      </>
    </div>
  );
};
export default Connections;