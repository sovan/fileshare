import ListHeader from "../controllers/listHeader";
import TableView from "../controllers/tableView";
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import { Loading } from "../controllers/loading";

export const List = () => {
  const {
    fetchData,
    records,
    getSchema,
    schema,
    insertData,
    serverError,
    onDelete,
    viewRecord,
    onView,
    loadingList,
  } = useAPI();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <ListHeader
        getSchema={getSchema}
        schema={schema}
        onSubmit={insertData}
        serverError={serverError}
      />
      {loadingList ? (
        <Loading />
      ) : (
        <TableView
          records={records}
          onDelete={onDelete}
          onView={onView}
          viewRecord={viewRecord}
        />
      )}
    </>
  );
};

export default List;
