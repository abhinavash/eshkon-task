export const config = {
  contentful: {
    spaceId: process.env.CONTENTFUL_SPACE_ID ?? "",
    environment: process.env.CONTENTFUL_ENVIRONMENT ?? "master",
    deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN ?? "",
    previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN ?? "",
    managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "",
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function assertServerConfig() {
  const { spaceId, environment, deliveryToken } = config.contentful;
  if (!spaceId || !environment || !deliveryToken) {
    throw new Error("Missing Contentful env vars. Check .env and README.");
  }
}
