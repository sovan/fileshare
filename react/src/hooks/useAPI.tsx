import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPageText,
  isPageConfig,
  type PageConfig,
} from "../utils/pageConfig";

const HOSTNAME = "http://localhost:3000/";
const getAuthHeaders = (): Record<string, string> => {
  const authToken = localStorage.getItem("authToken");
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

export type LocalAlert = {
  id: number;
  message: string;
  type: string;
};

type ListRecord = Record<string, unknown> & { _id: string };
type ListResponse = {
  records: ListRecord[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const isListRecord = (value: unknown): value is ListRecord =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  "_id" in value &&
  typeof value._id === "string";

const isListResponse = (value: unknown): value is ListResponse =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  "records" in value &&
  Array.isArray(value.records) &&
  value.records.every(isListRecord) &&
  "totalRecords" in value &&
  typeof value.totalRecords === "number" &&
  "page" in value &&
  typeof value.page === "number" &&
  "pageSize" in value &&
  typeof value.pageSize === "number" &&
  "totalPages" in value &&
  typeof value.totalPages === "number";

const getApiErrorMessage = (value: unknown, fallback: string): string =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  "error" in value &&
  typeof value.error === "string"
    ? value.error
    : fallback;

const useAPI = () => {
  const param = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState<ListRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [schema, setSchema] = useState({});
  const [pages, setPages] = useState<PageConfig>({});
  const [serverError, setServerError] = useState<unknown>(undefined);
  const [listError, setListError] = useState<string>();
  const [schemaError, setSchemaError] = useState<string>();
  const [viewRecord, setViewRecord] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [insertingData, setInsertingData] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [viewingData, setViewingData] = useState(false);
  const [alerts, setAlerts] = useState<LocalAlert[]>([]);

  const [selectedRecordId, setSelectedRecordId] = useState<string>();
  const fetchDataRequest = useRef<{
    key: string;
    promise: Promise<void>;
  } | null>(null);
  const fetchDataRequestId = useRef(0);
  const getSchemaRequest = useRef<Promise<void> | null>(null);
  const pagesRef = useRef<PageConfig>({});
  const clearServerError = useCallback(() => setServerError(undefined), []);
  useEffect(() => {
    const configuredDelay = pages.listSearchDebounceMs;
    const delay =
      typeof configuredDelay === "number" &&
      Number.isFinite(configuredDelay) &&
      configuredDelay >= 0
        ? configuredDelay
        : 1000;
    const timer = window.setTimeout(() => {
      setCurrentPage(1);
      setSearch(searchInput.trim());
    }, delay);
    return () => window.clearTimeout(timer);
  }, [pages, searchInput]);

  const redirectOnUnauthorized = useCallback(
    (response: Response) => {
      if (response.status !== 401) return false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("_id");
      void navigate(`/${param.one}/login`, { replace: true });
      return true;
    },
    [navigate, param.one],
  );

  const createAlert = (type: string, err: unknown) => {
    const id = Date.now();
    const message = err instanceof Error ? err.message : String(err);
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 3000);
  };

  const fetchData = useCallback(() => {
    const query = new URLSearchParams({ page: String(currentPage) });
    if (search.trim()) {
      query.set("search", search.trim());
    }
    const userId = localStorage.getItem("_id");
    if (localStorage.getItem("authToken") && userId) {
      query.set("_id", userId);
    }
    if (sortBy) {
      query.set("sortBy", sortBy);
      query.set("sortOrder", sortOrder);
    }
    const requestKey = `${param.one}/list?${query}`;
    if (fetchDataRequest.current?.key === requestKey) {
      return fetchDataRequest.current.promise;
    }

    const requestId = ++fetchDataRequestId.current;
    setListError(undefined);
    setLoadingList(true);
    const request = (async () => {
      try {
        const response = await fetch(`${HOSTNAME}${requestKey}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });
        if (redirectOnUnauthorized(response)) return;
        const data: unknown = await response.json();
        const fallback =
          getPageText(pagesRef.current, "loadRecordsError") ||
          "Unable to load records.";
        if (!response.ok) {
          throw new Error(getApiErrorMessage(data, fallback));
        }
        if (!isListResponse(data)) {
          throw new Error(fallback);
        }
        if (requestId === fetchDataRequestId.current) {
          setRecords(data.records);
          setTotalPages(data.totalPages);
          if (currentPage > data.totalPages) {
            setCurrentPage(data.totalPages);
          }
        }
      } catch (err) {
        if (requestId === fetchDataRequestId.current) {
          setListError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (requestId === fetchDataRequestId.current) {
          setLoadingList(false);
          fetchDataRequest.current = null;
        }
      }
    })();
    fetchDataRequest.current = { key: requestKey, promise: request };
    return request;
  }, [currentPage, param.one, redirectOnUnauthorized, search, sortBy, sortOrder]);

  const updateSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);
  const submitSearch = useCallback(() => {
    setCurrentPage(1);
    setSearch(searchInput.trim());
  }, [searchInput]);

  const toggleSort = useCallback((field: string) => {
    setCurrentPage(1);
    setSortOrder((currentOrder) => {
      if (sortBy === field) {
        return currentOrder === "asc" ? "desc" : "asc";
      }
      return "asc";
    });
    setSortBy(field);
  }, [sortBy]);

  const submitRecord = async (
    data: Record<string, unknown>,
    recordId?: string,
  ) => {
    const isUpdate = Boolean(recordId);
    const path = isUpdate
      ? `${param.one}/update/${recordId}`
      : `${param.one}/insert`;
    try {
      const response = await fetch(HOSTNAME + path, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (redirectOnUnauthorized(response)) return;
      const result = await response.json();
      if (isUpdate && response.status === 404) {
        createAlert(
          "danger",
          result.error || getPageText(pagesRef.current, "invalidUrl"),
        );
        return;
      }
      if (!response.ok) {
        setServerError(result);
        return;
      }

      setShowAdd(false);
      const successMessage = isUpdate ? "updateSuccess" : "insertSuccess";
      createAlert("success", getPageText(pagesRef.current, successMessage));
      await fetchData();
    } catch (err) {
      createAlert("danger", err);
    }
  };

  const insertData = async (payload: Record<string, unknown>) => {
    setInsertingData(true);
    const { _id, ...data } = payload;
    const recordId =
      typeof _id === "string" && _id.length > 0 ? _id : undefined;
    try {
      await submitRecord(data, recordId);
    } finally {
      setInsertingData(false);
    }
  };

  const getSchema = useCallback(() => {
    if (getSchemaRequest.current) return getSchemaRequest.current;

    setServerError(undefined);
    setSchemaError(undefined);
    const request = (async () => {
      try {
        const response = await fetch(HOSTNAME + param.one + "/schema");
        const data: unknown = await response.json();
        const fallback =
          getPageText(pagesRef.current, "invalidSchemaResponse") ||
          "Invalid schema response.";
        if (!response.ok) {
          throw new Error(getApiErrorMessage(data, fallback));
        }
        if (
          typeof data !== "object" ||
          data === null ||
          Array.isArray(data) ||
          !("schema" in data) ||
          typeof data.schema !== "object" ||
          data.schema === null ||
          Array.isArray(data.schema) ||
          !("pages" in data) ||
          !isPageConfig(data.pages)
        ) {
          throw new Error(fallback);
        }
        setSchema(data.schema);
        pagesRef.current = data.pages;
        setPages(pagesRef.current);
        setSchemaError(undefined);
      } catch (err) {
        setSchemaError(err instanceof Error ? err.message : String(err));
      } finally {
        getSchemaRequest.current = null;
      }
    })();
    getSchemaRequest.current = request;
    return request;
  }, [param.one]);

  const onDelete = async (id: string) => {
    setDeletingData(true);
    try {
      const response = await fetch(HOSTNAME + param.one + "/delete/" + id, {
        method: "DELETE",
      });
      if (redirectOnUnauthorized(response)) return;
      if (!response.ok) {
        const res: unknown = await response.json();
        if (response.status === 400) {
          setServerError(res);
        } else {
          const errorMessage =
            typeof res === "object" &&
            res !== null &&
            "error" in res &&
            typeof res.error === "string"
              ? res.error
              : getPageText(pagesRef.current, "invalidUrl");
          createAlert(
            "danger",
            errorMessage,
          );
        }
        return;
      }
      setShowDelete(false);
      createAlert("success", getPageText(pagesRef.current, "deleteSuccess"));
      await fetchData();
    } catch (err) {
      createAlert("danger", err);
    } finally {
      setDeletingData(false);
    }
  };

  const onView = async (id: string) => {
    setViewingData(true);
    setViewRecord({});
    try {
      const response = await fetch(HOSTNAME + param.one + "/view/" + id);
      if (redirectOnUnauthorized(response)) return;
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
    setViewRecord({ _id: id });
    try {
      const response = await fetch(HOSTNAME + param.one + "/edit/" + id);
      if (redirectOnUnauthorized(response)) return;
      const res = await response.json();
      setViewRecord(res);
    } catch (err) {
      createAlert("danger", err);
    } finally {
      setViewingData(false);
    }
  };
  const clearViewRecord = () => setViewRecord({});

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
    clearServerError,
    setSelectedRecordId,
    alerts,
    insertingData,
    deletingData,
    viewingData,
    schema,
    pages,
    records,
    currentPage,
    totalPages,
    setCurrentPage,
    sortBy,
    sortOrder,
    toggleSort,
    search: searchInput,
    updateSearch,
    submitSearch,
    serverError,
    viewRecord,
    loadingList,
    listError,
    schemaError,
    showDelete,
    showView,
    showAdd,
    selectedRecordId,
  };
};

export default useAPI;
