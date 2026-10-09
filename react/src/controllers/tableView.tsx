import Table from "react-bootstrap/Table";
import TableOperation from "./tableOperation";
import { DeleteModal } from "./deleteModal";
import { ViewModal } from "./viewModal";
import { useState } from "react";

type TableRecord = {
  _id: string;
  fname: string;
  lname: string;
  email: string;
};

type TableViewProps = {
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  setShowDelete: (show: boolean) => void;
  setShowView: (show: boolean) => void;
  getSchema: () => void;
  setShowAdd: (show: boolean) => void;
  viewRecord: unknown;
  showView: boolean;
  deletingData: boolean;
  viewingData: boolean;
  showDelete: boolean;
  records?: TableRecord[];
};

export const TableView = ({
  onDelete,
  onView,
  getSchema,
  setShowDelete,
  setShowView,
  setShowAdd,
  records = [],
  viewRecord,
  showDelete,
  showView,
  deletingData,
  viewingData,
}: TableViewProps) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>();

  return (
    <>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Operation</th>
          </tr>
        </thead>
        <tbody>
          {records.map((eachRecord) => (
            <tr key={eachRecord?._id}>
              <td>{eachRecord?.fname}</td>
              <td>{eachRecord?.lname}</td>
              <td>{eachRecord?.email}</td>
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
                  getSchema();
                  onView(eachRecord._id);
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
