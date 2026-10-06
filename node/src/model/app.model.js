import {
  validatorExtract,
  createSchemaFromTextFile,
} from "#controller/validator.js";

export const insertData = async (collection, data = {}) => {
  if (collection) {
    try {
      const insertReponse = await collection["model"].insertOne(data);
      return insertReponse;
    } catch (error) {
      return validatorExtract(error, collection["props"]);
    }
  }
};

export const removeData = async (collection, _id) => {
  if (collection) {
    try {
      const removeResponse = await collection["model"].findByIdAndDelete(_id);
      return removeResponse;
    } catch (error) {
      return { error: error };
    }
  }
};

export const findData = async (collection, query = {}, columns) => {
  if (collection) {
    try {
      const records = await collection["model"].find(query, columns);
      return records;
    } catch (error) {
      return error;
    }
  }
};

export const findAndUpdateData = async (
  collection,
  condition = {},
  $set,
  settings,
) => {
  if (collection) {
    try {
      const updateReponse = await collection["model"].findOneAndUpdate(
        condition,
        $set,
        settings,
      );
      return updateReponse;
    } catch (error) {
      return validatorExtract(error, collection["props"]);
    }
  }
};
