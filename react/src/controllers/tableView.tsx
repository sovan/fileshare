import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import TableOperation from "./tableOperation";
import { DeleteModal } from "./deleteModal";
import { ViewModal } from "./viewModal";
import { getPageText, type PageConfig } from "../utils/pageConfig";

type TableRecord = {
  [key: string]: unknown;
  _id: string;
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
  pages: PageConfig;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
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
  pages,
  currentPage,
  totalPages,
  setCurrentPage,
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
            <th>{getPageText(pages, "operationHeader")}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((eachRecord) => (
            <tr key={eachRecord?._id}>
              {body(eachRecord)}
              <TableOperation
                pages={pages}
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
      <Pagination className="justify-content-center">
        <Pagination.First
          aria-label={getPageText(pages, "firstPage")}
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(1)}
        />
        <Pagination.Prev
          aria-label={getPageText(pages, "previousPage")}
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        />
        <Pagination.Item active>{`${currentPage} / ${totalPages}`}</Pagination.Item>
        <Pagination.Next
          aria-label={getPageText(pages, "nextPage")}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
        <Pagination.Last
          aria-label={getPageText(pages, "lastPage")}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(totalPages)}
        />
      </Pagination>
      <DeleteModal
        show={showDelete}
        setShow={setShowDelete}
        pages={pages}
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
        pages={pages}
      />
    </>
  );
};

export default TableView;
