import { Button, Modal } from "react-bootstrap";
import Table from "react-bootstrap/Table";

type ViewModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  viewRecord: unknown;
};

const formatValue = (value: unknown): string | number => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  return JSON.stringify(value) ?? "";
};

export const ViewModal = ({ show, setShow, viewRecord }: ViewModalProps) => {
  const record =
    viewRecord && typeof viewRecord === "object" && !Array.isArray(viewRecord)
      ? (viewRecord as Record<string, unknown>)
      : {};

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>View user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
