import ProjectModel, { IProject } from "../../database/models/project.model";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../../lib/validation/portfolio.validation";
import { NotFoundException } from "../../lib/errors/catch-errors";

export class PortfolioService {
  public async createProject(input: CreateProjectInput): Promise<IProject> {
    const project = new ProjectModel({ ...input });
    await project.save();
    return project;
  }

  public async getAllProjects(
    page: number = 1,
    limit: number = 10,
    isPublished?: boolean,
    q?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: { isPublished?: boolean; $or?: any[] } = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $elemMatch: { $regex: q, $options: "i" } } },
      ];
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished;
    }

    const projects = await ProjectModel.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProjectModel.countDocuments(filter);

    return {
      projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getProjectById(projectId: string): Promise<IProject> {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  public async updateProject(
    projectId: string,
    input: UpdateProjectInput
  ): Promise<IProject> {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    Object.assign(project, input);
    await project.save();
    return project;
  }

  public async deleteProject(projectId: string): Promise<{ message: string }> {
    const result = await ProjectModel.findByIdAndDelete(projectId);
    if (!result) {
      throw new NotFoundException("Project not found");
    }
    return { message: "Project deleted successfully" };
  }
}
