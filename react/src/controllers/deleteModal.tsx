import { Button, Modal, Spinner } from "react-bootstrap";
import {
  getModalButtonAlignmentClass,
  getPageText,
  type PageConfig,
} from "../utils/pageConfig";

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
      <Modal.Footer
        className={getModalButtonAlignmentClass(pages, "deleteModalButtonAlignment")}
      >
        <Button
          variant="secondary"
          onClick={() => setShow(false)}
          disabled={deletingData}
        >
          {getPageText(pages, "cancelButton")}
        </Button>
        <Button variant="primary" onClick={onDelete} disabled={deletingData}>
          {deletingData && (
            <Spinner
              animation="border"
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
          )}
          {getPageText(
            pages,
            deletingData ? "deleteLoadingButton" : "deleteButton",
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
