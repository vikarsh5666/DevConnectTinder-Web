import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../utils/appstore";
import { addRequests, removeRequest } from "../utils/connectionRequestsSlice";
import { useEffect } from "react";

const ConnectionRequests = () => {
  const requests = useSelector((store: RootState) => store.connectionRequest);
  const dispatch = useDispatch();
  const reviewRequest = async (
    status: "accepted" | "rejected",
    _id: string
    ) => {
    try {
      axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) { }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.data));
    } catch (err) { }
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  if (!requests) return;

  if (requests.length === 0)
    return <h1 className="flex justify-center my-10"> No Requests Found</h1>;
  return (
    <div className="text-center my-4">
      {/* <h1 className="text-bold text-white text-3xl">Connection Requests</h1> */}
      <span className="text-bold text-white text-3xl">
        Connection Requests <div className="badge badge-sm badge-secondary">{requests.length}</div>
      </span>

      {requests.map((request) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          request.fromUserId;

        return (
          <div
            key={_id}
            className="flex items-center m-4 p-4 rounded-lg bg-base-300 w-full max-w-3xl mx-auto"
          >
            <div className="w-50">
              <img
                alt="photo"
                className="w-20 h-20 rounded-full"
                src={photoUrl}
              />
            </div>
            <div className="text-left mx-4 ">
              <h2 className="font-bold text-xl">
                {firstName + " " + lastName}
              </h2>
              {age && gender && <p>{age + ", " + gender}</p>}
              <p>{about}</p>
            </div>
            <div className="flex">
              <button
                className="btn btn-primary mx-2 mb-4"
                onClick={() => reviewRequest("rejected", request._id)}
              >
                Reject
              </button>
              <button
                className="btn btn-secondary mx-2"
                onClick={() => reviewRequest("accepted", request._id)}
              >
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default ConnectionRequests;