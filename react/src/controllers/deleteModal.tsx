import { Button, Modal } from "react-bootstrap";

type DeleteModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
  deletingData: boolean;
};

export const DeleteModal = ({
  show,
  setShow,
  onDelete,
  deletingData,
}: DeleteModalProps) => {
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header>
        <Modal.Title>Delete user</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete?</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShow(false)}
          disabled={deletingData}
        >
          Close
        </Button>
        <Button variant="primary" onClick={onDelete} disabled={deletingData}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
