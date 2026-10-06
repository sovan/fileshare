import { Routes, Route } from "react-router-dom";
import List from "./controllers/list";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home Page</h1>} />
      <Route path="/about" element={<h1>About Pages</h1>} />
      <Route path="/contact" element={<h1>Contact Page</h1>} />
      <Route path="/:one" element={<List />} />
    </Routes>
  );
};

export default Router;
