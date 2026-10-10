import Table from "react-bootstrap/Table";
import TableOperation from "./tableOperation";
import { DeleteModal } from "./deleteModal";
import { ViewModal } from "./viewModal";

type TableRecord = {
  [key: string]: unknown;
  _id: string;
  fname: string;
  lname: string;
  email: string;
};

type SchemaField = {
  name?: string;
  operation?: string[];
};

type TableViewProps = {
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  setShowDelete: (show: boolean) => void;
  setShowView: (show: boolean) => void;
  setShowAdd: (show: boolean) => void;
  setSelectedRecordId: (id: string) => void;

  viewRecord: unknown;
  showView: boolean;
  deletingData: boolean;
  viewingData: boolean;
  showDelete: boolean;
  records?: TableRecord[];
  selectedRecordId?: string;
  schema: unknown;
};

const formatCellValue = (value: unknown): string | number => {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return String(value);
  return JSON.stringify(value) ?? "";
};

export const TableView = ({
  onDelete,
  onView,
  onEdit,
  setShowDelete,
  setShowView,
  setShowAdd,
  setSelectedRecordId,
  records = [],
  viewRecord,
  showDelete,
  showView,
  deletingData,
  viewingData,
  selectedRecordId,
  schema,
}: TableViewProps) => {
  const schemaFields =
    schema && typeof schema === "object" && !Array.isArray(schema)
      ? (schema as Record<string, SchemaField>)
      : {};
  const headers = Object.entries(schemaFields)
    .filter(([, field]) => field.operation?.includes("list"))
    .map(([key, field]) => <th key={key}>{field.name ?? key}</th>);

  const body = (eachRecord: TableRecord) =>
    Object.entries(schemaFields)
      .filter(([, field]) => field.operation?.includes("list"))
      .map(([key]) => <td key={key}>{formatCellValue(eachRecord[key])}</td>);

  return (
    <>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            {headers}
            <th>Operation</th>
          </tr>
        </thead>
        <tbody>
          {records.map((eachRecord) => (
            <tr key={eachRecord?._id}>
              {body(eachRecord)}
              <TableOperation
                onDeleteClick={() => {
                  setSelectedRecordId(eachRecord._id);
                  setShowDelete(true);
                }}
                onViewClick={() => {
                  onView(eachRecord._id);
                  setShowView(true);
                }}
                onEditClick={() => {
                  setShowAdd(true);
                  onEdit(eachRecord._id);
                  setSelectedRecordId(eachRecord._id);
                }}
              />
            </tr>
          ))}
        </tbody>
      </Table>
      <DeleteModal
        show={showDelete}
        setShow={setShowDelete}
        onDelete={() => {
          if (selectedRecordId) {
            onDelete(selectedRecordId);
            setShowDelete(false);
          }
        }}
        deletingData={deletingData}
      />
      <ViewModal
        show={showView}
        setShow={setShowView}
        viewRecord={viewRecord}
        viewingData={viewingData}
      />
    </>
  );
};

export default TableView;
