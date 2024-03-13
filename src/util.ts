import { MovieDetail } from "./api/query";

export const filterDuplicate = (list: MovieDetail[]) => {
  return list.filter(
    (obj, index) => list.findIndex((item) => item.id === obj.id) === index
  );
};

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
