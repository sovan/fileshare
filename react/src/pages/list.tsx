import ListHeader from "../controllers/listHeader";
import TableView from "../controllers/tableView";
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import { Loading } from "../controllers/loading";
import { AlertPopup } from "../controllers/alertPopup";

export const List = () => {
  const {
    fetchData,
    getSchema,
    insertData,
    onDelete,
    onView,
    onEdit,
    setShowDelete,
    setShowView,
    setShowAdd,
    clearViewRecord,
    setSelectedRecordId,
    alerts,
    insertingData,
    deletingData,
    viewingData,
    records,
    schema,
    viewRecord,
    loadingList,
    showView,
    showDelete,
    showAdd,
    serverError,
    selectedRecordId,
  } = useAPI();

  useEffect(() => {
    void fetchData();
    void getSchema();
  }, [fetchData, getSchema]);

  return (
    <>
      {AlertPopup(alerts)}
      <ListHeader
        onSubmit={insertData}
        setShowAdd={setShowAdd}
        insertingData={insertingData}
        serverError={serverError}
        schema={schema}
        showAdd={showAdd}
        viewRecord={viewRecord}
        clearViewRecord={clearViewRecord}
      />
      {loadingList ? (
        <Loading />
      ) : (
        <TableView
          schema={schema}
          onDelete={onDelete}
          onView={onView}
          onEdit={onEdit}
          setShowDelete={setShowDelete}
          setShowView={setShowView}
          setShowAdd={setShowAdd}
          setSelectedRecordId={setSelectedRecordId}
          deletingData={deletingData}
          viewingData={viewingData}
          viewRecord={viewRecord}
          records={records}
          showView={showView}
          showDelete={showDelete}
          selectedRecordId={selectedRecordId}
        />
      )}
    </>
  );
};

export default List;
