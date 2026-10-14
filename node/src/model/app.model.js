import { validatorExtract } from "#controller/validator.js";

export const insertData = async (collection, data = {}, uniqueIndex) => {
  if (collection) {
    try {
      const insertReponse = await collection["model"].insertOne(data);
      return insertReponse;
    } catch (error) {
      console.log("start----------------------------");

      //console.log(error);
      console.log(error?.errors);
      console.log("end----------------------------");
      return validatorExtract(error, collection["props"], uniqueIndex);
    }
  }
};

export const findAndUpdateData = async (
  collection,
  condition,
  $set,
  uniqueIndex,
) => {
  if (collection) {
    try {
      const filter = condition ?? {};
      const update = { ...$set };
      delete update.createdAt;
      update.updatedAt = new Date();
      const updateReponse = await collection["model"].findOneAndUpdate(
        filter,
        update,
        {
          returnDocument: "after",
          runValidators: true,
          context: "query",
        },
      );
      return updateReponse;
    } catch (error) {
      return validatorExtract(error, collection["props"], uniqueIndex);
    }
  }
};

export const removeData = async (collection, _id) => {
  if (collection) {
    try {
      const condition = typeof _id === "object" && _id !== null ? _id : { _id };
      const removeResponse =
        await collection["model"].findOneAndDelete(condition);
      return removeResponse;
    } catch (error) {
      return { error: error };
    }
  }
};

export const findData = async (
  collection,
  query,
  columns,
  page = 1,
  pageSize = 10,
  sort = {},
) => {
  if (collection) {
    try {
      const filter = query === undefined ? {} : query;
      const [records, totalRecords] = await Promise.all([
        collection["model"]
          .find(filter, columns)
          .sort(sort)
          .skip((page - 1) * pageSize)
          .limit(pageSize),
        collection["model"].countDocuments(filter),
      ]);
      return {
        records,
        totalRecords,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalRecords / pageSize)),
      };
    } catch (error) {
      return error;
    }
  }
};

export const findOneData = async (collection, query, columns) => {
  if (collection) {
    try {
      const filter = query === undefined ? {} : query;
      const records = await collection["model"].findOne(filter, columns);
      return records;
    } catch (error) {
      return error;
    }
  }
};
