import ListHeader from "../controllers/listHeader";
import TableView from "../controllers/tableView";
import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import { Loading } from "../controllers/loading";
import { AlertPopup } from "../controllers/alertPopup";
import Alert from "react-bootstrap/Alert";

export const List = () => {
  const {
    fetchData,
    getSchema,
    insertData,
    onDelete,
    onView,
    onEdit,
    onCustomAction,
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
    records,
    pages,
    currentPage,
    totalPages,
    setCurrentPage,
    sortBy,
    sortOrder,
    toggleSort,
    search,
    updateSearch,
    submitSearch,
    filterValues,
    updateFilter,
    applyFilters,
    clearFilters,
    applyingFilters,
    schema,
    viewRecord,
    loadingList,
    listError,
    schemaError,
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
      {listError || schemaError ? (
        <Alert variant="danger" role="alert">
          {listError || schemaError}
        </Alert>
      ) : (
        <>
          <ListHeader
            onSubmit={insertData}
            setShowAdd={setShowAdd}
            clearServerError={clearServerError}
            pages={pages}
            insertingData={insertingData}
            loadingRecord={viewingData && showAdd}
            isLoading={
              loadingList || insertingData || deletingData || viewingData
            }
            serverError={serverError}
            schema={schema}
            showAdd={showAdd}
            viewRecord={viewRecord}
            clearViewRecord={clearViewRecord}
            search={search}
            onSearch={updateSearch}
            onSearchSubmit={submitSearch}
            filterValues={filterValues}
            onFilterChange={updateFilter}
            onFilterSubmit={applyFilters}
            onFilterClear={clearFilters}
            closeFilterOnAction={pages.closeFilterOnAction !== false}
            applyingFilters={applyingFilters}
            disableFilterControlsWhileApplying={
              pages.disableFilterControlsWhileApplying !== false
            }
          />
          {loadingList ? (
            <Loading pages={pages} centered large />
          ) : (
            <TableView
              schema={schema}
              pages={pages}
              onDelete={onDelete}
              onView={onView}
              onEdit={onEdit}
              onCustomAction={onCustomAction}
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
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={toggleSort}
            />
          )}
        </>
      )}
    </>
  );
};

export default List;
