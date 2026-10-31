import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import PageLoader from "./PageLoader";
import api, { isRequestCanceled, isUnauthorized } from "../utils/api";
import { addUser } from "../utils/userSlice";
import { useAppDispatch, useAppSelector } from "../utils/hooks";

const Body = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useAppSelector((store) => store.user);

  useEffect(() => {
    if (userData || location.pathname === "/login") return;

    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const res = await api.get("/profile/view", { signal: controller.signal });
        dispatch(addUser(res.data));
      } catch (err: unknown) {
        if (isRequestCanceled(err)) return;
        if (isUnauthorized(err)) {
          navigate("/login");
          return;
        }
        console.error(err);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, [userData, location.pathname, dispatch, navigate]);

  return (
    <div>
      <NavBar />
      <main className="pt-16">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Body;
