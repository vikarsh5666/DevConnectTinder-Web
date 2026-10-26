import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import PageLoader from "./PageLoader";
import api from "../utils/api";
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

    let cancelled = false;

    const getFeed = async () => {
      try {
        const res = await api.get("/feed");
        if (!cancelled) dispatch(addFeed(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    getFeed();
    return () => {
      cancelled = true;
    };
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
