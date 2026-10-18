import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Feed from "./components/Feed";
import appStore from './utils/appstore';
import { Provider } from "react-redux";
import Profile from "./components/Profile";
import Connections from "./components/Connections";
import ConnectionRequests from "./components/ConnectionRequests";
import Premium from "./components/Premium";
import Chat from "./components/chat";

function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Chat />} />
              <Route path="/login" element={<Login />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/connectionRequests" element={<ConnectionRequests />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/chat/:targetUserId" element={<Chat />} />
            </Route >
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
