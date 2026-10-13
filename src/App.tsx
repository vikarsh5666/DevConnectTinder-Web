import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./Body";
import Login from "./Login";

function App() {

  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route path="/login" element={<Login/>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Route >
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
