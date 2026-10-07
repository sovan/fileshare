import { useState } from "react";
import { useParams } from "react-router-dom";

const HOSTNAME = "http://localhost:3000/";
const useAPI = () => {
  const param = useParams();
  const [records, setRecords] = useState([]);
  const [schema, setSchema] = useState({});
  const [serverError, setServerError] = useState(undefined);
  const [viewRecord, setViewRecord] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchData = async () => {
    setLoadingList(true);
    try {
      const response = await fetch(HOSTNAME + param.one + "/list");
      setRecords(await response.json());
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingList(false);
    }
  };

  const insertData = async (payload: object) => {
    try {
      const response = await fetch(HOSTNAME + param.one + "/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json();
      if (response?.status === 400) setServerError(res);
    } catch (err) {
      console.log(err);
    }
  };

  const getSchema = async () => {
    setServerError(undefined);
    try {
      const response = await fetch(HOSTNAME + param.one + "/schema");
      setSchema(await response.json());
    } catch (err) {
      console.log(err);
    }
  };

  const onDelete = async (id: string) => {
    try {
      const response = await fetch(HOSTNAME + param.one + "/delete/" + id, {
        method: "DELETE",
      });
      const res = await response.json();
      if (response?.status === 400) setServerError(res);
    } catch (err) {
      console.log(err);
    }
  };

  const onView = async (id: string) => {
    try {
      const response = await fetch(HOSTNAME + param.one + "/view/" + id);
      const res = await response.json();

      setViewRecord(res);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    records,
    fetchData,
    getSchema,
    schema,
    serverError,
    insertData,
    onView,
    onDelete,
    viewRecord,
    loadingList,
  };
};

export default useAPI;
