import { describe, expect, it } from "vitest";

import { buildCloudinaryThumbnailUrl } from "./build-cloudinary-thumbnail-url";

describe("buildCloudinaryThumbnailUrl", () => {
  it("should insert width/quality/format transforms right after the upload segment", () => {
    const imageUrl =
      "https://res.cloudinary.com/demo/image/upload/v1783695481/store-demo/abc123.jpg";

    expect(buildCloudinaryThumbnailUrl(imageUrl, 400)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_400,q_auto,f_auto/v1783695481/store-demo/abc123.jpg",
    );
  });

  it("should return the original url unchanged when it is not a Cloudinary upload url", () => {
    const imageUrl = "https://example.com/not-cloudinary.jpg";

    expect(buildCloudinaryThumbnailUrl(imageUrl, 400)).toBe(imageUrl);
  });
});
