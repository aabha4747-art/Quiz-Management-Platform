import {
  createContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

export const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user");

    try {
      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] =
    useState(true);

  /*
   * LOGIN
   *
   * LoginPage calls:
   *
   * login(email, password)
   *
   * This function now:
   * 1. sends credentials to backend
   * 2. saves JWT
   * 3. saves user
   * 4. updates React state
   * 5. returns the logged-in user
   */
  const login = async (
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const {
      token,
      user: loggedInUser,
    } = response.data;

    if (!token || !loggedInUser) {
      throw new Error(
        "Invalid login response"
      );
    }

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return loggedInUser;
  };

  /*
   * LOGOUT
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the backend logout request
      // fails, remove local authentication.
    } finally {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      setUser(null);
    }
  };

  /*
   * RESTORE LOGIN AFTER REFRESH
   */
  useEffect(() => {
    const restoreSession =
      async () => {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const response =
            await api.get(
              "/auth/me"
            );

          const currentUser =
            response.data.user;

          setUser(currentUser);

          localStorage.setItem(
            "user",
            JSON.stringify(
              currentUser
            )
          );
        } catch {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}