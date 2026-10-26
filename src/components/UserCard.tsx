import { memo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import { removeUserFromFeed } from "../utils/feedSlice";
import { useAppDispatch } from "../utils/hooks";
import type { User } from "../utils/types";

type UserCardProps = {
  user: User;
  isHideActionBtn?: boolean;
};

const SWIPE_THRESHOLD = 100;

const UserCard = ({ user, isHideActionBtn }: UserCardProps) => {
  const { _id, firstName, lastName, photoUrl, about, age, gender } = user;
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const isAnimatingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isReadOnly =
    location.pathname === "/connections" || location.pathname === "/profile";

  const applyTransform = (x: number, withTransition: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = withTransition ? "transform 0.4s ease-out" : "none";
    el.style.transform = `translateX(${x}px) rotate(${x * 0.05}deg)`;
  };

  const resetPosition = () => {
    currentX.current = 0;
    applyTransform(0, true);
    isAnimatingRef.current = false;
    setIsAnimating(false);
  };

  const handleSendRequest = async (
    status: "interested" | "ignored",
    userId: string
  ) => {
    try {
      await api.post(`/request/send/${status}/${userId}`);
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      console.error("Failed to send request:", error);
      resetPosition();
    }
  };

  const handleStart = (clientX: number) => {
    if (isReadOnly || isAnimatingRef.current) return;
    startX.current = clientX;
    currentX.current = 0;
    isDragging.current = true;
    applyTransform(0, false);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return;
    const distance = clientX - startX.current;
    currentX.current = distance;
    applyTransform(distance, false);
  };

  const handleEnd = async () => {
    if (isReadOnly || !isDragging.current) return;
    isDragging.current = false;

    const distance = currentX.current;
    if (distance > SWIPE_THRESHOLD) {
      isAnimatingRef.current = true;
      setIsAnimating(true);
      applyTransform(window.innerWidth * 1.2, true);
      await handleSendRequest("interested", _id);
    } else if (distance < -SWIPE_THRESHOLD) {
      isAnimatingRef.current = true;
      setIsAnimating(true);
      applyTransform(-window.innerWidth * 1.2, true);
      await handleSendRequest("ignored", _id);
    } else {
      resetPosition();
    }
  };

  const handleButtonRequest = async (status: "interested" | "ignored") => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    await handleSendRequest(status, _id);
  };

  return (
    <div
      ref={cardRef}
      className="card bg-base-300 w-full max-w-md mx-auto shadow-sm select-none rounded-xl overflow-hidden"
      style={{ touchAction: "pan-y", cursor: isAnimating ? "default" : "grab" }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
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
          <p>
            {age}, {gender}
          </p>
        )}
        <p>{about}</p>
        {!isHideActionBtn && (
          <div className="card-actions justify-center my-4">
            <button
              className="btn btn-primary"
              disabled={isAnimating}
              onClick={() => handleButtonRequest("ignored")}
            >
              Ignore
            </button>
            <button
              className="btn btn-secondary"
              disabled={isAnimating}
              onClick={() => handleButtonRequest("interested")}
            >
              Interested
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(UserCard);
