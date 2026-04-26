import API from "./axios-client";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validations/portfolio-validator";

type ProjectResponse = {
  success: boolean;
  message: string;
  data?: {
    project: IProject;
  };
};

type ProjectsResponse = {
  success: boolean;
  message: string;
  data?: {
    projects: IProject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type GetAllProjectsParams = {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  q?: string;
};

export const portfolioService = {
  getAllProjects: async ({
    page = 1,
    limit = 10,
    isPublished,
    q,
  }: GetAllProjectsParams = {}): Promise<ProjectsResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (q) {
      params.append("q", q);
    }
    if (isPublished !== undefined) {
      params.append("published", String(isPublished));
    }
    const response = await API.get(`/portfolio?${params.toString()}`);
    return response.data;
  },

  getProjectById: async (projectId: string): Promise<ProjectResponse> => {
    const response = await API.get(`/portfolio/${projectId}`);
    return response.data;
  },

  createProject: async (
    payload: CreateProjectInput
  ): Promise<ProjectResponse> => {
    const response = await API.post("/portfolio", payload);
    return response.data;
  },

  updateProject: async (
    projectId: string,
    payload: UpdateProjectInput
  ): Promise<ProjectResponse> => {
    const response = await API.patch(`/portfolio/${projectId}`, payload);
    return response.data;
  },

  deleteProject: async (projectId: string): Promise<{ message: string }> => {
    const response = await API.delete(`/portfolio/${projectId}`);
    return response.data;
  },
};
