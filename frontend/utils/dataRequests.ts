import axios from "axios";
import { Dispatch } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";

export const fetchData = async (url: string,authToken: string, setDataHook?: Dispatch<any>) => {
  const res = await axios.get(url,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    },
  );

  if (setDataHook) {
    setDataHook(res.data)
  }
  return res.data
}

export const submitData = async (url: string, data: Object,authToken?: string, setDataHook?: Dispatch<any>) => {
  var res;
  if (authToken) {
    res = await axios.post(url, data,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      });
  } else {
    res = await axios.post(url, data);
  }

  if (setDataHook) {
    setDataHook(res.data)
  }
  return res.data
}

export const putData = async (url: string, data?: Object, authToken?: string, setDataHook?: Dispatch<any>) => {
  var res;
  if (authToken) {
    res = await axios.put(url, data? data: undefined,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      },
    );
  } else {
    res = await axios.put(url, data? data: undefined);
  }

  if (setDataHook) {
    setDataHook(res.data)
  }
  return res.data
}

export const deleteEntry = async (url: string) => {
  const res = await axios.delete(url,
    {
      auth: {
        username: "umar123",
        password: "hello123",
      },
    },
  );
}