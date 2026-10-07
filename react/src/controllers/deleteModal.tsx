import { Button, Modal } from "react-bootstrap";

type DeleteModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  id: string;
  onDelete: (id: string) => unknown;
};

export const DeleteModal = ({
  show,
  setShow,
  id,
  onDelete,
}: DeleteModalProps) => {
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Delete user</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={() => onDelete(id)}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
