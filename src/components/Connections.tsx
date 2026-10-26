import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import PageLoader from "./PageLoader";
import api from "../utils/api";
import { addConnections } from "../utils/connectionSlice";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import type { User } from "../utils/types";

const Connections = () => {
  const [isOpenConnectionProfile, setIsOpenConnectionProfile] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const connections = useAppSelector((store) => store.connections);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    const fetchConnections = async () => {
      try {
        const res = await api.get("/user/connections");
        if (!cancelled) dispatch(addConnections(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchConnections();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const handleChatClick = (connection: User) => {
    navigate(`/chat/${connection._id}`, {
      state: { photoUrl: connection.photoUrl },
    });
  };

  const selectedConnection = connections?.find(
    (connection) => connection._id === selectedConnectionId
  );

  if (isLoading && !connections) return <PageLoader label="Loading connections..." />;
  if (!connections || connections.length === 0) {
    return <h1 className="my-10 text-center">No Connections Found</h1>;
  }

  return (
    <div className="text-center my-10">
      <span className="text-bold text-white text-3xl">
        Connections{" "}
        <div className="badge badge-sm badge-secondary">{connections.length}</div>
      </span>

      {connections.map((connection) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          connection;
        return (
          <div
            key={_id}
            className="flex items-center m-4 p-4 rounded-lg bg-base-300 w-full max-w-3xl mx-auto"
            onClick={() => {
              setIsOpenConnectionProfile(true);
              setSelectedConnectionId(_id);
            }}
          >
            <div>
              <img
                alt={`${firstName} ${lastName}`}
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
                loading="lazy"
              />
            </div>
            <div className="text-left mx-4 flex-1">
              <h2 className="font-bold text-xl text-yellow-300">
                {firstName} {lastName}
              </h2>
              {age && gender && <p>{age}, {gender}</p>}
              <p>{about}</p>
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChatClick(connection);
                }}
                className="btn btn-primary shrink-0 ml-auto"
              >
                Chat
              </button>
            </div>
          </div>
        );
      })}

      {isOpenConnectionProfile && selectedConnection && (
        <dialog id="my_modal_1" className="modal" open>
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
            <UserCard user={selectedConnection} isHideActionBtn />
          </div>
        </dialog>
      )}
    </div>
  );
};

export default Connections;
