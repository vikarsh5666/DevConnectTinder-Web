import EditProfile from "./EditProfile";
import { useAppSelector } from "../utils/hooks";

const Profile = () => {
  const user = useAppSelector((store) => store.user);
  if (!user) return null;
  return <EditProfile user={user} />;
};

export default Profile;
