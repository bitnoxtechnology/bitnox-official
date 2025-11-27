type UserType = {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

interface ErrorResponse {
  success: boolean;
  message: string;
  errorName?: string;
}
