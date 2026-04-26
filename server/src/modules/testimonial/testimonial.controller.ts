import { Request, Response } from "express";
import { TestimonialService } from "./testimonial.service";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from "../../lib/validation/testimonial.validation";
import { asyncHandler } from "../../middlewares/async-handler";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";

export class TestimonialController {
  private testimonialService: TestimonialService;

  constructor(testimonialService: TestimonialService) {
    this.testimonialService = testimonialService;
  }

  public createTestimonial = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const validatedBody = createTestimonialSchema.parse(req.body);
      const testimonial =
        await this.testimonialService.createTestimonial(validatedBody);
      return res.status(HTTPSTATUSCODE.CREATED).json({
        success: true,
        message: "Testimonial created successfully",
        data: { testimonial },
      });
    }
  );

  public getAllTestimonials = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { page, limit, featured } = req.query;
      const isFeatured =
        featured === "true" ? true : featured === "false" ? false : undefined;

      const data = await this.testimonialService.getAllTestimonials(
        Number(page) || 1,
        Number(limit) || 50,
        isFeatured
      );

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data,
      });
    }
  );

  public getTestimonialById = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { testimonialId } = req.params;
      const testimonial =
        await this.testimonialService.getTestimonialById(testimonialId);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { testimonial },
      });
    }
  );

  public updateTestimonial = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { testimonialId } = req.params;
      const validatedBody = updateTestimonialSchema.parse(req.body);
      const testimonial = await this.testimonialService.updateTestimonial(
        testimonialId,
        validatedBody
      );
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { testimonial },
      });
    }
  );

  public deleteTestimonial = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { testimonialId } = req.params;
      const result =
        await this.testimonialService.deleteTestimonial(testimonialId);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { result },
      });
    }
  );
}

export const testimonialController = new TestimonialController(
  new TestimonialService()
);
