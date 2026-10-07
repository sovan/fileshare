import { Button, Modal } from "react-bootstrap";
export const EditModal = ({ show, setShow }) => {
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit user</Modal.Title>
      </Modal.Header>
      <Modal.Body>Edit</Modal.Body>
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

export default EditModal;
