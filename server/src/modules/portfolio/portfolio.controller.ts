import { Request, Response } from "express";
import { PortfolioService } from "./portfolio.service";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../lib/validation/portfolio.validation";
import { asyncHandler } from "../../middlewares/async-handler";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";

export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor(portfolioService: PortfolioService) {
    this.portfolioService = portfolioService;
  }

  public createProject = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const validatedBody = createProjectSchema.parse(req.body);
      const project = await this.portfolioService.createProject(validatedBody);
      return res.status(HTTPSTATUSCODE.CREATED).json({
        success: true,
        message: "Project created successfully",
        data: { project },
      });
    }
  );

  public getAllProjects = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { page, limit, published, q } = req.query;
      const isPublished =
        published === "true" ? true : published === "false" ? false : undefined;

      const data = await this.portfolioService.getAllProjects(
        Number(page) || 1,
        Number(limit) || 10,
        isPublished,
        q as string
      );

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data,
      });
    }
  );

  public getProjectById = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { projectId } = req.params;
      const project = await this.portfolioService.getProjectById(projectId);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { project },
      });
    }
  );

  public updateProject = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { projectId } = req.params;
      const validatedBody = updateProjectSchema.parse(req.body);
      const project = await this.portfolioService.updateProject(
        projectId,
        validatedBody
      );
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { project },
      });
    }
  );

  public deleteProject = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { projectId } = req.params;
      const result = await this.portfolioService.deleteProject(projectId);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { result },
      });
    }
  );
}

export const portfolioController = new PortfolioController(
  new PortfolioService()
);
