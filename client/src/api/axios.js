import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
      IMPORTANT:
      Do not force Content-Type to application/json here.

      Axios will automatically use:
      application/json for normal objects

      and:

      multipart/form-data for FormData/file uploads.
    */

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) =>
    response,

  (error) => {
    if (
      error.response?.status ===
      401
    ) {
      const message =
        error.response?.data
          ?.message || "";

      /*
        Avoid removing token for every
        possible 401 if you don't want
        automatic logout.

        These common messages indicate
        an invalid/expired session.
      */

      if (
        message
          .toLowerCase()
          .includes(
            "token"
          ) ||
        message
          .toLowerCase()
          .includes(
            "authentication"
          )
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );
      }
    }

    return Promise.reject(
      error
    );
  }
);

export default api;