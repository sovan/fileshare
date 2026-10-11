import { Button, Table } from "react-bootstrap";
import { BsArrowDown, BsArrowUp, BsArrowDownUp } from "react-icons/bs";
import TableOperation from "./tableOperation";
import Pagination from "./pagination";
import { DeleteModal } from "./deleteModal";
import { ViewModal } from "./viewModal";
import { getPageText, type PageConfig } from "../utils/pageConfig";
import { formatDateTime } from "../utils/dateTime";

type TableRecord = {
  [key: string]: unknown;
  _id: string;
};

type SchemaField = {
  name?: string;
  type?: string;
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
  sortBy?: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
};

const formatCellValue = (
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
  if (typeof value === "boolean") return String(value);
  return JSON.stringify(value) ?? "";
};

const getAriaSort = (
  isActiveSort: boolean,
  sortOrder: "asc" | "desc",
): "ascending" | "descending" | "none" => {
  if (!isActiveSort) return "none";
  return sortOrder === "asc" ? "ascending" : "descending";
};

const getSortIcon = (isActiveSort: boolean, sortOrder: "asc" | "desc") => {
  if (!isActiveSort) {
    return <BsArrowDownUp className="text-muted" />;
  }
  if (sortOrder === "asc") {
    return <BsArrowUp />;
  }
  return <BsArrowDown />;
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
  sortBy,
  sortOrder,
  onSort,
}: TableViewProps) => {
  const schemaFields =
    schema && typeof schema === "object" && !Array.isArray(schema)
      ? (schema as Record<string, SchemaField>)
      : {};
  const dateTimeFormat =
    typeof pages.dateTimeFormat === "string"
      ? pages.dateTimeFormat
      : "MM/DD/YYYY hh:mm:ss A";
  const headers = Object.entries(schemaFields)
    .filter(([, field]) => field.operation?.includes("list"))
    .map(([key, field]) => {
      const label = field.name ?? key;
      const isSortable = field.operation?.includes("sort");
      const isActiveSort = sortBy === key;
      return (
        <th
          key={key}
          aria-sort={getAriaSort(isActiveSort, sortOrder)}
        >
          {isSortable ? (
            <Button
              variant="link"
              className="p-0 text-decoration-none text-reset fw-semibold"
              onClick={() => onSort(key)}
            >
              {label}
              {records.length !== 1 && (
                <span
                  className="d-inline-flex flex-column ms-2 align-middle"
                  aria-hidden="true"
                  style={{ lineHeight: "0.65" }}
                >
                  {getSortIcon(isActiveSort, sortOrder)}
                </span>
              )}
            </Button>
          ) : (
            label
          )}
        </th>
      );
    });

  const body = (eachRecord: TableRecord) =>
    Object.entries(schemaFields)
      .filter(([, field]) => field.operation?.includes("list"))
      .map(([key, field]) => (
        <td key={key}>
          {formatCellValue(eachRecord[key], field, dateTimeFormat)}
        </td>
      ));

  return (
    <>
      <Table striped bordered hover size="sm">
        {records.length > 0 && (
          <thead>
            <tr>
              {headers}
              <th>{getPageText(pages, "operationHeader")}</th>
            </tr>
          </thead>
        )}
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={headers.length + 1} className="text-center">
                {getPageText(pages, "noRecordsMessage")}
              </td>
            </tr>
          ) : (
            records.map((eachRecord) => (
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
            ))
          )}
        </tbody>
      </Table>
      {records.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          pages={pages}
        />
      )}
      <DeleteModal
        show={showDelete}
        setShow={setShowDelete}
        pages={pages}
        onDelete={() => {
          if (selectedRecordId) {
            onDelete(selectedRecordId);
          }
        }}
        deletingData={deletingData}
      />
      <ViewModal
        show={showView}
        setShow={setShowView}
        viewRecord={viewRecord}
        schema={schema}
        viewingData={viewingData}
        pages={pages}
      />
    </>
  );
};

export default TableView;
