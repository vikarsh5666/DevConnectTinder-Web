import { useEffect, useState } from "react";
import PageLoader from "./PageLoader";
import api, { isRequestCanceled } from "../utils/api";
import { addRequests, removeRequest } from "../utils/connectionRequestsSlice";
import { useAppDispatch, useAppSelector } from "../utils/hooks";

const ConnectionRequests = () => {
  const requests = useAppSelector((store) => store.connectionRequest);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(requests.length === 0);

  const reviewRequest = async (status: "accepted" | "rejected", _id: string) => {
    try {
      await api.post(`/request/review/${status}/${_id}`);
      dispatch(removeRequest(_id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      try {
        const res = await api.get("/user/requests/received", {
          signal: controller.signal,
        });
        dispatch(addRequests(res.data.data));
      } catch (err) {
        if (isRequestCanceled(err)) return;
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchRequests();
    return () => controller.abort();
  }, [dispatch]);

  if (isLoading) return <PageLoader label="Loading requests..." />;
  if (requests.length === 0) {
    return <h1 className="flex justify-center my-10">No Requests Found</h1>;
  }

  return (
    <div className="text-center my-4">
      <span className="text-bold text-white text-3xl">
        Connection Requests{" "}
        <div className="badge badge-sm badge-secondary">{requests.length}</div>
      </span>

      {requests.map((request) => {
        const { firstName, lastName, photoUrl, age, gender, about } =
          request.fromUserId;

        return (
          <div
            key={request._id}
            className="flex items-center m-4 p-4 rounded-lg bg-base-300 w-full max-w-3xl mx-auto"
          >
            <div className="w-50">
              <img
                alt={`${firstName} ${lastName}`}
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
                loading="lazy"
              />
            </div>
            <div className="text-left mx-4">
              <h2 className="font-bold text-xl">
                {firstName} {lastName}
              </h2>
              {age && gender && <p>{age}, {gender}</p>}
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
