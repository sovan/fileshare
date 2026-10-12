import { Button, Modal } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { Loading } from "./loading";
import {
  getModalButtonAlignmentClass,
  getPageText,
  getPageVariant,
  type PageConfig,
} from "../utils/pageConfig";
import { formatDateTime } from "../utils/dateTime";

type ViewModalProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  viewRecord: unknown;
  schema: unknown;
  viewingData: boolean;
  pages: PageConfig;
};

type SchemaField = {
  type?: string;
};

const formatValue = (
  value: unknown,
  field: SchemaField | undefined,
  dateTimeFormat: string,
): string | number => {
  if (value === null || value === undefined) return "";
  if (
    field?.type === "Date" &&
    (typeof value === "string" ||
      typeof value === "number" ||
      value instanceof Date)
  ) {
    return formatDateTime(value, dateTimeFormat);
  }
  if (typeof value === "string" || typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "fname" in value &&
    "lname" in value &&
    typeof value.fname === "string" &&
    typeof value.lname === "string"
  ) {
    return [value.fname, value.lname].filter(Boolean).join(" ");
  }
  return JSON.stringify(value) ?? "";
};

export const ViewModal = ({
  show,
  setShow,
  viewRecord,
  schema,
  viewingData,
  pages,
}: ViewModalProps) => {
  const record =
    viewRecord && typeof viewRecord === "object" && !Array.isArray(viewRecord)
      ? (viewRecord as Record<string, unknown>)
      : {};
  const schemaFields =
    schema && typeof schema === "object" && !Array.isArray(schema)
      ? (schema as Record<string, SchemaField>)
      : {};
  const dateTimeFormat =
    typeof pages.dateTimeFormat === "string"
      ? pages.dateTimeFormat
      : "MM/DD/YYYY hh:mm:ss A";

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
                  <td>
                    {formatValue(value, schemaFields[key], dateTimeFormat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer
        className={getModalButtonAlignmentClass(
          pages,
          "viewModalButtonAlignment",
        )}
      >
        <Button
          variant={getPageVariant(pages, "viewCloseButtonVariant", "secondary")}
          onClick={() => setShow(false)}
        >
          {getPageText(pages, "closeButton")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewModal;
