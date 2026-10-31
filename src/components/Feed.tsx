import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import PageLoader from "./PageLoader";
import api, { isRequestCanceled } from "../utils/api";
import { addFeed } from "../utils/feedSlice";
import { useAppDispatch, useAppSelector } from "../utils/hooks";

const Feed = () => {
  const feed = useAppSelector((store) => store.feed);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(feed.length === 0);

  useEffect(() => {
    if (feed.length > 0) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const getFeed = async () => {
      try {
        const res = await api.get("/feed", { signal: controller.signal });
        dispatch(addFeed(res.data));
      } catch (err) {
        if (isRequestCanceled(err)) return;
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    getFeed();
    return () => controller.abort();
  }, [dispatch, feed.length]);

  if (isLoading) return <PageLoader label="Finding developers..." />;

  return (
    <div className="w-full overflow-x-clip">
      {feed.length > 0 ? (
        <UserCard user={feed[0]} isHideActionBtn />
      ) : (
        <p className="text-center text-lg">No more profiles to show!</p>
      )}
    </div>
  );
};

export default Feed;
