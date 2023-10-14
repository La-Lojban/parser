const privateState = {};

export const getState = (key) => {
  if (typeof key === "undefined") return privateState;
  return privateState[key];
};

export const setState = (key, value) => {
  privateState[key] = value;
  return privateState;
};

export const destroyAll = () => {
  Object.keys(privateState).forEach((key) => {
    const obj = privateState[key];
    obj.delete(obj.graph);
  });
};

export const clearElement = (id) => {
  const el = document.getElementById(id);
  const elClone = el.cloneNode();
  el.parentNode.replaceChild(elClone, el);
};
