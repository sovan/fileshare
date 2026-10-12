import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const HeaderPanel = () => {
  useLocation();
  const navigate = useNavigate();
  const isAuthenticated =
    Boolean(localStorage.getItem("authToken")) &&
    Boolean(localStorage.getItem("_id"));

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("_id");
    void navigate("/user/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          MyLogo
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              Contact
            </Nav.Link>
            <Nav.Link as={Link} to="/user">
              User
            </Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/project">
                  Project
                </Nav.Link>
                <Nav.Link as="button" onClick={logout}>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/user/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderPanel;
