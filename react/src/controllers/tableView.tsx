import Table from "react-bootstrap/Table";
import TableOperation from "./tableOperation";

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
};

export const TableView = ({
  records = [],
  onDelete,
  onView,
  viewRecord,
}: TableViewProps) => {
  return (
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
              id={eachRecord?._id}
              onDelete={onDelete}
              onView={onView}
              viewRecord={viewRecord}
            />
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TableView;
