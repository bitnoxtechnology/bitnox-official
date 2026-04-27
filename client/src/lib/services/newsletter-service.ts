import API from "./axios-client";

type SubscribeResponse = {
  success: boolean;
  message: string;
  data?: { subscriber: INewsletterSubscriber };
};

type SubscribersResponse = {
  success: boolean;
  data?: {
    subscribers: INewsletterSubscriber[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type GetSubscribersParams = {
  page?: number;
  limit?: number;
  active?: boolean;
  q?: string;
};

export const newsletterService = {
  subscribe: async (email: string): Promise<SubscribeResponse> => {
    try {
      const response = await API.post("/newsletter/subscribe", { email });
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || {
        success: false,
        message: "Failed to subscribe",
      };
    }
  },

  getAllSubscribers: async ({
    page = 1,
    limit = 20,
    active,
    q,
  }: GetSubscribersParams = {}): Promise<SubscribersResponse> => {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (active !== undefined) params.append("active", String(active));
      if (q) params.append("q", q);
      const response = await API.get(`/newsletter?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || {
        success: false,
        message: "Failed to fetch subscribers",
      };
    }
  },

  updateSubscriberStatus: async (
    subscriberId: string,
    isActive: boolean
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await API.patch(
        `/newsletter/${subscriberId}/status`,
        { isActive }
      );
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || {
        success: false,
        message: "Failed to update subscriber",
      };
    }
  },

  deleteSubscriber: async (
    subscriberId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await API.delete(`/newsletter/${subscriberId}`);
      return response.data;
    } catch (error: unknown) {
      throw (error as ErrorResponse) || {
        success: false,
        message: "Failed to delete subscriber",
      };
    }
  },
};
