import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Body from "./components/Body";
import Login from "./components/Login";
import appStore from "./utils/appstore";

const Feed = lazy(() => import("./components/Feed"));
const Profile = lazy(() => import("./components/Profile"));
const Connections = lazy(() => import("./components/Connections"));
const ConnectionRequests = lazy(() => import("./components/ConnectionRequests"));
const Premium = lazy(() => import("./components/Premium"));
const Chat = lazy(() => import("./components/chat"));

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Feed />} />
            <Route path="login" element={<Login />} />
            <Route path="feed" element={<Feed />} />
            <Route path="profile" element={<Profile />} />
            <Route path="connections" element={<Connections />} />
            <Route path="connectionRequests" element={<ConnectionRequests />} />
            <Route path="premium" element={<Premium />} />
            <Route path="chat/:targetUserId" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
