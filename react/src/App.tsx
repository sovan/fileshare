import { BrowserRouter } from "react-router-dom";
import HeaderPanel from "./headerPanel";
import Router from "./router.tsx";
import { Container } from "react-bootstrap";

export const App = () => {
  return (
    <BrowserRouter>
      <HeaderPanel />
      <Container className="py-1 py-md-4">
        <Router />
      </Container>
    </BrowserRouter>
  );
};

export default App;
