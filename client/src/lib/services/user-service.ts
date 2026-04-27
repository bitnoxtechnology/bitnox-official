import API from "./axios-client";

type CreateUserPayload = {
  name: string;
  email: string;
  role: UserRole;
};

type UpdateUserPayload = {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
};

type UserListResponse = {
  success: boolean;
  data?: { users: IAdminUser[] };
};

type UserResponse = {
  success: boolean;
  message?: string;
  data?: { user: IAdminUser };
};

export const userService = {
  getAllUsers: async (): Promise<UserListResponse> => {
    try {
      const response = await API.get("/users");
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || { success: false, message: "Failed to fetch users" };
    }
  },

  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    try {
      const response = await API.post("/users", payload);
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || { success: false, message: "Failed to create user" };
    }
  },

  updateUser: async (
    userId: string,
    payload: UpdateUserPayload
  ): Promise<UserResponse> => {
    try {
      const response = await API.patch(`/users/${userId}`, payload);
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || { success: false, message: "Failed to update user" };
    }
  },

  deleteUser: async (
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await API.delete(`/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || { success: false, message: "Failed to delete user" };
    }
  },
};
