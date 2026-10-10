import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

const HOSTNAME = "http://localhost:3000/";

export type LocalAlert = {
  id: number;
  message: string;
  type: string;
};

const useAPI = () => {
  const param = useParams();
  const [records, setRecords] = useState([]);
  const [schema, setSchema] = useState({});
  const [serverError, setServerError] = useState(undefined);
  const [viewRecord, setViewRecord] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [insertingData, setInsertingData] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [viewingData, setViewingData] = useState(false);
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);

  const [selectedRecordId, setSelectedRecordId] = useState<string>();

  const createAlert = (type: string, err: unknown) => {
    const id = Date.now();
    const message = err instanceof Error ? err.message : String(err);
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 3000);
  };

  const fetchData = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch(HOSTNAME + param.one + "/list");
      setRecords(await response.json());
    } catch (err) {
      createAlert("danger", err);
    } finally {
      setLoadingList(false);
    }
  }, [param.one]);

  const insertData = async (payload: Record<string, unknown>) => {
    setInsertingData(true);
    const { _id, ...data } = payload;
    if (typeof _id === "string" && _id.length > 0) {
      try {
        const response = await fetch(HOSTNAME + param.one + "/update/" + _id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const res = await response.json();
        if (response?.status === 400) setServerError(res);
        else if (response?.status === 404) {
          createAlert("danger", res.error || "Invalid URL");
        } else {
          setShowAdd(false);
          createAlert("success", "Record updated successfully");
          await fetchData();
        }
      } catch (err) {
        createAlert("danger", err);
      } finally {
        setInsertingData(false);
      }
    } else {
      try {
        const response = await fetch(HOSTNAME + param.one + "/insert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const res = await response.json();
        if (response?.status === 400) setServerError(res);
        else {
          setShowAdd(false);
          createAlert("success", "Record inserted successfully");
          await fetchData();
        }
      } catch (err) {
        createAlert("danger", err);
      } finally {
        setInsertingData(false);
      }
    }
  };

  const getSchema = async () => {
    setServerError(undefined);
    try {
      const response = await fetch(HOSTNAME + param.one + "/schema");
      setSchema(await response.json());
    } catch (err) {
      createAlert("danger", err);
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
        createAlert("success", "Record deleted successfully");
        await fetchData();
      }
    } catch (err) {
      createAlert("danger", err);
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
      createAlert("danger", err);
    } finally {
      setViewingData(false);
    }
  };
  const onEdit = async (id: string) => {
    setViewingData(true);
    setViewRecord([]);
    try {
      const response = await fetch(HOSTNAME + param.one + "/edit/" + id);
      const res = await response.json();
      setViewRecord(res);
    } catch (err) {
      createAlert("danger", err);
    } finally {
      setViewingData(false);
    }
  };
  const clearViewRecord = () => setViewRecord([]);

  return {
    getSchema,
    fetchData,
    insertData,
    onView,
    onEdit,
    onDelete,
    setShowDelete,
    setShowView,
    setShowAdd,
    clearViewRecord,
    setSelectedRecordId,
    alerts,
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
    showAdd,
    selectedRecordId,
  };
};

export default useAPI;
