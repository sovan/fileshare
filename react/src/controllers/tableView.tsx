import Table from "react-bootstrap/Table";
import TableOperation from "./tableOperation";

export const TableView = ({ records = [], onDelete, onView, viewRecord }) => {
  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Operation {records | ""}</th>
        </tr>
      </thead>
      <tbody>
        {records.map((eachRecord) => (
          <tr key={eachRecord?._id}>
            <td>{eachRecord.fname}</td>
            <td>{eachRecord.lname}</td>
            <td>{eachRecord.email}</td>
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
