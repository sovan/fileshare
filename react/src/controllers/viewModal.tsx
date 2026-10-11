import { Button, Modal } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { Loading } from "./loading";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type ViewModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  viewRecord: unknown;
  viewingData: boolean;
  pages: PageConfig;
};

const formatValue = (value: unknown): string | number => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  return JSON.stringify(value) ?? "";
};

export const ViewModal = ({
  show,
  setShow,
  viewRecord,
  viewingData,
  pages,
}: ViewModalProps) => {
  const record =
    viewRecord && typeof viewRecord === "object" && !Array.isArray(viewRecord)
      ? (viewRecord as Record<string, unknown>)
      : {};

  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>{getPageText(pages, "viewTitle")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {viewingData ? (
          <Loading pages={pages} />
        ) : (
          <Table striped bordered hover size="sm">
            <tbody>
              {Object.entries(record).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{formatValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          {getPageText(pages, "closeButton")}
        </Button>
        <Button variant="primary" onClick={() => setShow(false)}>
          {getPageText(pages, "saveButton")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewModal;
