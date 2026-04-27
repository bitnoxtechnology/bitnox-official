import NewsletterSubscriberModel, {
  INewsletterSubscriber,
} from "../../database/models/newsletter-subscriber.model";
import {
  SubscribeInput,
  UpdateSubscriberStatusInput,
} from "../../lib/validation/newsletter.validation";
import {
  BadRequestException,
  NotFoundException,
} from "../../lib/errors/catch-errors";

export class NewsletterService {
  public async subscribe(input: SubscribeInput): Promise<INewsletterSubscriber> {
    const existing = await NewsletterSubscriberModel.findOne({
      email: input.email.toLowerCase(),
    });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return existing;
      }
      throw new BadRequestException(
        "This email is already subscribed to our newsletter"
      );
    }

    const subscriber = new NewsletterSubscriberModel({ email: input.email });
    await subscriber.save();
    return subscriber;
  }

  public async getAllSubscribers(
    page: number = 1,
    limit: number = 20,
    isActive?: boolean,
    q?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: { isActive?: boolean; email?: any } = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (q) {
      filter.email = { $regex: q, $options: "i" };
    }

    const subscribers = await NewsletterSubscriberModel.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NewsletterSubscriberModel.countDocuments(filter);

    return {
      subscribers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async updateSubscriberStatus(
    subscriberId: string,
    input: UpdateSubscriberStatusInput
  ): Promise<INewsletterSubscriber> {
    const subscriber = await NewsletterSubscriberModel.findByIdAndUpdate(
      subscriberId,
      { isActive: input.isActive },
      { new: true }
    );
    if (!subscriber) {
      throw new NotFoundException("Subscriber not found");
    }
    return subscriber;
  }

  public async deleteSubscriber(
    subscriberId: string
  ): Promise<{ message: string }> {
    const result = await NewsletterSubscriberModel.findByIdAndDelete(
      subscriberId
    );
    if (!result) {
      throw new NotFoundException("Subscriber not found");
    }
    return { message: "Subscriber deleted successfully" };
  }
}
