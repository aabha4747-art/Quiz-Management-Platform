import api from "./axios";

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch(
    "/auth/profile",
    profileData
  );

  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.patch(
    "/auth/password",
    passwordData
  );

  return response.data;
};

const userApi = {
  getCurrentUser,
  updateProfile,
  changePassword,
};

export default userApi;