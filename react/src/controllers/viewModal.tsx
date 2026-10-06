import { Button, Modal, Form } from "react-bootstrap";
import Table from "react-bootstrap/Table";

export const ViewModal = ({ show, setShow, viewRecord }) => {
  const viewRecordKey = Object.keys(viewRecord);
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>View user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover size="sm">
          <tbody>
            {viewRecordKey.map((eachRow) => (
              <tr>
                <td>{eachRow}</td>
                <td>{viewRecord[eachRow]}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={() => setShow(false)}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewModal;
