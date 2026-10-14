import { useSelector } from "react-redux";
import type { RootState } from "../utils/appstore";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store: RootState) => store.user);
  return (
    user && (
      <div>
        <EditProfile user={user} />
      </div>
    )
  );
};
export default Profile;