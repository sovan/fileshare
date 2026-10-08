import Table from "react-bootstrap/Table";
import TableOperation from "./tableOperation";
import { DeleteModal } from "./deleteModal";
import { ViewModal } from "./viewModal";
import { EditModal } from "./editModal";
import { useState } from "react";

type TableRecord = {
  _id: string;
  fname: string;
  lname: string;
  email: string;
};

type TableViewProps = {
  records?: TableRecord[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  viewRecord: unknown;
  showDelete: boolean;
  setShowDelete: (show: boolean) => void;
  showView: boolean;
  setShowView: (show: boolean) => void;
  showEdit: boolean;
  setShowEdit: (show: boolean) => void;
  deletingData: boolean;
  viewingData: boolean;
};

export const TableView = ({
  records = [],
  onDelete,
  onView,
  viewRecord,
  showDelete,
  setShowDelete,
  showView,
  setShowView,
  showEdit,
  setShowEdit,
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
                setShowEdit={setShowEdit}
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
      <EditModal show={showEdit} setShow={setShowEdit} />
    </>
  );
};

export default TableView;
