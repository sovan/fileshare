import { Button, Modal } from "react-bootstrap";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type DeleteModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
  deletingData: boolean;
  pages: PageConfig;
};

export const DeleteModal = ({
  show,
  setShow,
  onDelete,
  deletingData,
  pages,
}: DeleteModalProps) => {
  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>{getPageText(pages, "deleteTitle")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{getPageText(pages, "deleteMessage")}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShow(false)}
          disabled={deletingData}
        >
          {getPageText(pages, "cancelButton")}
        </Button>
        <Button variant="primary" onClick={onDelete} disabled={deletingData}>
          {getPageText(pages, "deleteButton")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
