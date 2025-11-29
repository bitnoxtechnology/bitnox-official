let accessToken: string | null = null;

export const tokenStorage = {
  set(token: string) {
    accessToken = token;
  },
  get(): string | null {
    return accessToken;
  },
  clear() {
    accessToken = null;
  },
};
