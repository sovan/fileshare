import ListHeader from "./listHeader";
import TableView from "./tableView";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const List = () => {
  const [records, setRecords] = useState([]);
  const [viewRecord, setViewRecord] = useState([]);
  const [schema, setSchema] = useState({});
  const [serverError, setServerError] = useState(undefined);
  const param = useParams();
  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/" + param.one + "/list",
      );
      setRecords(await response.json());
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const getSchema = async () => {
    setServerError(undefined);
    try {
      const response = await fetch(
        "http://localhost:3000/" + param.one + "/schema",
      );
      setSchema(await response.json());
    } catch (err) {
      console.log(err.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (payload) => {
    try {
      const response = await fetch(
        "http://localhost:3000/" + param.one + "/insert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const res = await response.json();
      response.status === 400 ? setServerError(res) : "";
    } catch (err) {
      console.log(err.message);
    }
  };
  const onDelete = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:3000/" + param.one + "/delete/" + id,
        {
          method: "DELETE",
        },
      );
      const res = await response.json();
      response.status === 400 ? setServerError(res) : "";
    } catch (err) {
      console.log(err.message);
    }
  };
  const onView = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:3000/" + param.one + "/view/" + id,
      );
      const res = await response.json();

      setViewRecord(res);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <>
      <ListHeader
        getSchema={getSchema}
        schema={schema}
        onSubmit={onSubmit}
        serverError={serverError}
      />
      <TableView
        records={records}
        serverError={serverError}
        onDelete={onDelete}
        onView={onView}
        viewRecord={viewRecord}
      />
    </>
  );
};

export default List;
