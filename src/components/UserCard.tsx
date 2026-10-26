
import { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { useLocation } from "react-router-dom";

const UserCard = (props: any) => {
    const {
        _id,
        firstName,
        lastName,
        photoUrl,
        about,
        age,
        gender,
    } = props.user;

    const { isHideActionBtn } = props;
    const dispatch = useDispatch();
    const location = useLocation();
    const [swipeX, setSwipeX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);
    const isAnimatingRef = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isConnections = location.pathname === "/connections";
    const isProfile = location.pathname === "/profile";
    const handleSendRequest = async (
        status: "interested" | "ignored",
        userId: string
    ) => {
        try {
            await axios.post(
                `${BASE_URL}/request/send/${status}/${userId}`,
                {},
                { withCredentials: true }
            );

            dispatch(removeUserFromFeed(userId));
        } catch (error) {
            console.error("Failed to send request:", error);

            currentX.current = 0;
            setSwipeX(0);
            isAnimatingRef.current = false;
            setIsAnimating(false);
        }
    };

    const handleStart = (clientX: number) => {
        if ((isConnections || isProfile) || isAnimatingRef.current) return;

        startX.current = clientX;
        currentX.current = 0;
        isDragging.current = true;
    };

    const handleMove = (clientX: number) => {
        if (!isDragging.current) return;

        const distance = clientX - startX.current;

        currentX.current = distance;
        setSwipeX(distance);
    };

    const handleEnd = async () => {
        if ((isConnections || isProfile) || !isDragging.current) return;

        isDragging.current = false;

        const distance = currentX.current;
        const SWIPE_THRESHOLD = 100;

        if (distance > SWIPE_THRESHOLD) {
            isAnimatingRef.current = true;
            setIsAnimating(true);

            setSwipeX(window.innerWidth * 1.2);

            await handleSendRequest("interested", _id);
        } else if (distance < -SWIPE_THRESHOLD) {
            isAnimatingRef.current = true;
            setIsAnimating(true);

            setSwipeX(-window.innerWidth * 1.2);

            await handleSendRequest("ignored", _id);
        } else {
            currentX.current = 0;
            setSwipeX(0);
        }
    };

    const handleButtonRequest = async (
        status: "interested" | "ignored"
    ) => {
        if (isAnimatingRef.current) return;

        isAnimatingRef.current = true;
        setIsAnimating(true);

        await handleSendRequest(status, _id);
    };

    return (
        <div
            ref={cardRef}
            className="card bg-base-300 w-full max-w-md mx-auto shadow-sm select-none rounded-xl overflow-hidden"
            style={{
                transform: `translateX(${swipeX}px) rotate(${swipeX * 0.05}deg)`,
                transition: isDragging.current
                    ? "none"
                    : "transform 0.4s ease-out",
                touchAction: "pan-y",
                cursor: isAnimating ? "default" : "grab",
            }}
            onTouchStart={(e) =>
                handleStart(e.touches[0].clientX)
            }
            onTouchMove={(e) =>
                handleMove(e.touches[0].clientX)
            }
            onTouchEnd={handleEnd}
            onMouseDown={(e) =>
                handleStart(e.clientX)
            }
            onMouseMove={(e) =>
                handleMove(e.clientX)
            }
            onMouseUp={handleEnd}
            onMouseLeave={() => {
                if (isDragging.current) handleEnd();
            }}
        >
            <figure>
                <img
                    className="w-full h-[73vh] object-cover pointer-events-none"
                    src={photoUrl}
                    alt={`${firstName} ${lastName}`}
                    draggable={false}
                />
            </figure>

            <div className="card-body text-justify">
                <h2 className="card-title">
                    {firstName} {lastName}
                </h2>

                {age && gender && (
                    <p>{age}, {gender}</p>
                )}

                <p>{about}</p>

                {!isHideActionBtn && (
                    <div className="card-actions justify-center my-4">
                        <button
                            className="btn btn-primary"
                            disabled={isAnimating}
                            onClick={() =>
                                handleButtonRequest("ignored")
                            }
                        >
                            Ignore
                        </button>

                        <button
                            className="btn btn-secondary"
                            disabled={isAnimating}
                            onClick={() =>
                                handleButtonRequest("interested")
                            }
                        >
                            Interested
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCard;
