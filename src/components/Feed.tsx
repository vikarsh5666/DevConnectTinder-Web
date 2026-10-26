
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../utils/appstore";
import { addFeed } from "../utils/feedSlice";
import { useEffect } from "react";
import UserCard from "../components/UserCard";

const Feed = () => {
    const feed = useSelector((store: RootState) => store.feed);
    const isHideActionBtn = true;
    const dispatch = useDispatch();

    const getFeed = async () => {
        if (feed.length > 0) return;

        try {
            const res = await axios.get(`${BASE_URL}/feed`, {
                withCredentials: true,
            });

            dispatch(addFeed(res.data));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getFeed();
    }, []);

    return (
        <div
            className={
                isHideActionBtn
                    ? "w-full overflow-x-clip"
                    : "w-full flex justify-center my-4 px-4 overflow-x-clip"
            }
        >
            {feed.length > 0 ? (
                <UserCard
                    key={feed[0]._id}
                    user={feed[0]}
                    isHideActionBtn={isHideActionBtn}
                />
            ) : (
                <p className="text-center text-lg">
                    No more profiles to show!
                </p>
            )}
        </div>
    );
};

export default Feed;
