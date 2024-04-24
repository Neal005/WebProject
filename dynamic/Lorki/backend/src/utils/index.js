const _ = require("lodash");
const getInfoData = (object = {}, filter = []) => {
  return _.pick(object, filter);
};

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

module.exports = {
  getInfoData,
  getKey,
};
