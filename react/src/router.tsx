import { Navigate, Routes, Route, useParams } from "react-router-dom";
import List from "./pages/list";
import Login from "./pages/login";

const AuthenticatedList = () => {
  const hasAuthentication =
    Boolean(localStorage.getItem("authToken")) &&
    Boolean(localStorage.getItem("_id"));

  return hasAuthentication ? (
    <List />
  ) : (
    <Navigate to="/user/login" replace />
  );
};

const UnauthenticatedLogin = () => {
  const { one: collection } = useParams();
  const hasAuthentication =
    Boolean(localStorage.getItem("authToken")) &&
    Boolean(localStorage.getItem("_id"));

  if (collection !== "user") {
    return <Navigate to="/user/login" replace />;
  }

  return hasAuthentication ? (
    <Navigate to={`/${collection}`} replace />
  ) : (
    <Login />
  );
};

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home Page</h1>} />
      <Route path="/about" element={<h1>About Pages</h1>} />
      <Route path="/contact" element={<h1>Contact Page</h1>} />
      <Route path="/:one/login" element={<UnauthenticatedLogin />} />
      <Route path="/:one" element={<AuthenticatedList />} />
    </Routes>
  );
};

export default Router;
