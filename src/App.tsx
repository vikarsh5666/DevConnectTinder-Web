import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import appStore from './utils/appstore';
import { Provider } from "react-redux";

const Feed = lazy(() => import("./components/Feed"));
const Profile = lazy(() => import("./components/Profile"));
const Connections = lazy(() => import("./components/Connections"));
const ConnectionRequests = lazy(() => import("./components/ConnectionRequests"));
const Premium = lazy(() => import("./components/Premium"));
const Chat = lazy(() => import("./components/chat"));


function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Suspense fallback={
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-sm font-medium text-base-content/70">
                Loading, please wait...
              </p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Body />}>
                <Route path="/" element={<Feed />} />
                <Route path="/login" element={<Login />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/connectionRequests" element={<ConnectionRequests />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/chat/:targetUserId" element={<Chat />} />
              </Route >
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
