import axios from "axios";
import {BASE_URL} from "../utils/constants";
import { useDispatch } from "react-redux";
import {removeUserFromFeed} from "../utils/feedSlice";

const UserCard = (props: any) => {
    const { _id, firstName, lastName, photoUrl, about, age, gender } = props.user;
    debugger;
    const { isHideActionBtn } = props;
    const dispatch = useDispatch();

    const handleSendRequest = async (
        status: "interested" | "ignored",
        userId: string
    ) => {
        await axios.post(
            BASE_URL + '/request/send/' + status + '/' + userId,
            {},
            { withCredentials: true }
        );
        dispatch(removeUserFromFeed(userId));

    };


    return (
        <div className="card bg-base-300 shadow-sm">
            <figure>
                <img
                    className="h-64 w-full object-cover"
                    src={photoUrl}
                    alt="photo" />
            </figure>
            <div className="card-body text-justify">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                {age && gender && <p>{age + " , " + gender}</p>}
                <p>{about}</p>
                {!isHideActionBtn && (<div className="card-actions justify-center my-4">
                    <button className="btn btn-primary"
                    onClick={() => handleSendRequest('ignored', _id)}
                    >Ignore</button>
                    <button className="btn btn-secondary"
                    onClick={() => handleSendRequest('interested', _id)}
                    >Interested</button>
                </div>
                )}
            </div>
        </div>
    )
}

export default UserCard