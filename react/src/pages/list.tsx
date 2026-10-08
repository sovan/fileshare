import ListHeader from "../controllers/listHeader";
import TableView from "../controllers/tableView";
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import { Loading } from "../controllers/loading";

export const List = () => {
  const {
    fetchData,
    getSchema,
    insertData,
    onDelete,
    onView,
    setShowDelete,
    setShowView,
    setShowEdit,
    setShowAdd,
    insertingData,
    deletingData,
    viewingData,
    records,
    schema,
    viewRecord,
    loadingList,
    showView,
    showDelete,
    showEdit,
    showAdd,
    serverError,
  } = useAPI();

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <>
      <ListHeader
        getSchema={getSchema}
        onSubmit={insertData}
        setShowAdd={setShowAdd}
        insertingData={insertingData}
        serverError={serverError}
        schema={schema}
        showAdd={showAdd}
      />
      {loadingList ? (
        <Loading />
      ) : (
        <TableView
          onDelete={onDelete}
          onView={onView}
          setShowDelete={setShowDelete}
          setShowView={setShowView}
          setShowEdit={setShowEdit}
          deletingData={deletingData}
          viewingData={viewingData}
          viewRecord={viewRecord}
          records={records}
          showView={showView}
          showEdit={showEdit}
          showDelete={showDelete}
        />
      )}
    </>
  );
};

export default List;
