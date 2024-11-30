import axios from "axios";
import {
    Props } from "./fetchData.interface";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const useAxios = async (props: Props) => {

  const {url, method, body, headers} = props;
  
  try {
    let res = await axios[method](url, headers, body);
    return res.data;
  } catch (err) {
    return err;
  }
};

export default useAxios;
