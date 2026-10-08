import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

const HOSTNAME = "http://localhost:3000/";
const useAPI = () => {
  const param = useParams();
  const [records, setRecords] = useState([]);
  const [schema, setSchema] = useState({});
  const [serverError, setServerError] = useState(undefined);
  const [viewRecord, setViewRecord] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [insertingData, setInsertingData] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [viewingData, setViewingData] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch(HOSTNAME + param.one + "/list");
      setRecords(await response.json());
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingList(false);
    }
  }, [param.one]);

  const insertData = async (payload: object) => {
    setInsertingData(true);
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
      else {
        setShowAdd(false);
        await fetchData();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setInsertingData(false);
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
    setDeletingData(true);
    try {
      const response = await fetch(HOSTNAME + param.one + "/delete/" + id, {
        method: "DELETE",
      });
      const res = await response.json();
      if (response?.status === 400) setServerError(res);
      else {
        setShowDelete(false);
        await fetchData();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingData(false);
    }
  };

  const onView = async (id: string) => {
    setViewingData(true);
    setViewRecord([]);
    try {
      const response = await fetch(HOSTNAME + param.one + "/view/" + id);
      const res = await response.json();
      setViewRecord(res);
    } catch (err) {
      console.log(err);
    } finally {
      setViewingData(false);
    }
  };

  return {
    getSchema,
    fetchData,
    insertData,
    onView,
    onDelete,
    setShowDelete,
    setShowView,
    setShowEdit,
    setShowAdd,
    insertingData,
    deletingData,
    viewingData,
    schema,
    records,
    serverError,
    viewRecord,
    loadingList,
    showDelete,
    showView,
    showEdit,
    showAdd,
  };
};

export default useAPI;
