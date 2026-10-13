import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import appStore from './utils/appstore';
import { Provider } from "react-redux";

function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<div>Profile Page</div>} />
            </Route >
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  )
}

export default App
