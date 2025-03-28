import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getImageDimensions,
  getMaxImageDimensions,
  imageToPng,
} from "@/lib/utils/image";

describe("lib/utils/image.ts", () => {
  const mockURL = {
    createObjectURL: vi.fn(),
    revokeObjectURL: vi.fn(),
  };

  beforeEach(() => {
    // @ts-ignore
    mockURL.createObjectURL.mockReturnValue("blob:test");
    global.URL = mockURL;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.URL = undefined;
  });

  describe("getImageDimensions", () => {
    it("should return image dimensions", async () => {
      const mockFile = new File([""], "test.jpg");
      const mockImage = {
        width: 100,
        height: 200,
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, "Image").mockImplementation(() => mockImage as any);

      const dimensionsPromise = getImageDimensions(mockFile);
      mockImage.onload();

      const dimensions = await dimensionsPromise;
      expect(dimensions).toEqual({ width: 100, height: 200 });
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });

    it("should reject on error", async () => {
      const mockFile = new File([""], "test.jpg");
      const mockImage = {
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, "Image").mockImplementation(() => mockImage as any);
      const dimensionsPromise = getImageDimensions(mockFile);

      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockFile);
      mockImage.onerror(new Error("Test error"));

      await expect(dimensionsPromise).rejects.toThrow("Test error");
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });

  describe("getMaxImageDimensions", () => {
    it("should return max dimensions from multiple files", async () => {
      const mockFile1 = new File([""], "test1.jpg");
      const mockFile2 = new File([""], "test2.jpg");

      const mockImage1 = { width: 300, height: 400, onload: null as any };
      const mockImage2 = { width: 500, height: 200, onload: null as any };
      vi.spyOn(window, "Image")
        .mockImplementationOnce(() => mockImage1 as any)
        .mockImplementationOnce(() => mockImage2 as any);

      const promise = getMaxImageDimensions([mockFile1, mockFile2]);
      mockImage1.onload();
      mockImage2.onload();

      const result = await promise;
      expect(result).toEqual({ width: 500, height: 400 });
    });

    it("should handle an empty file list", async () => {
      const result = await getMaxImageDimensions([]);
      expect(result).toEqual({ width: 0, height: 0 });
    });

    it("should reject if any file fails to load", async () => {
      const mockFile1 = new File([""], "test1.jpg");
      const mockFile2 = new File([""], "test2.jpg");

      const mockImage1 = { onload: null as any };
      const mockImage2 = { onload: null as any, onerror: null as any };
      vi.spyOn(window, "Image")
        .mockImplementationOnce(() => mockImage1 as any)
        .mockImplementationOnce(() => mockImage2 as any);

      const promise = getMaxImageDimensions([mockFile1, mockFile2]);
      mockImage1.onload();
      mockImage2.onerror(new Error("Load failed"));

      await expect(promise).rejects.toThrow("Load failed");
    });
  });

  describe("imageToPng", () => {
    it("should convert image to PNG", async () => {
      const mockFile = new File([""], "test.jpg");
      const mockImage = {
        width: 100,
        height: 200,
        onload: null as any,
        onerror: null as any,
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
        }),
        toBlob: vi.fn().mockImplementation((cb) => cb(new Blob())),
      };

      vi.spyOn(window, "Image").mockImplementation(() => mockImage as any);
      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as any);

      const pngPromise = imageToPng(mockFile);
      mockImage.onload();

      const result = await pngPromise;
      expect(result.type).toBe("image/png");
      expect(result.name).toBe("test.png");
      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });

    it("should handle image load errors", async () => {
      const mockFile = new File([""], "test.jpg");
      const mockImage = {
        onerror: null as any,
      };

      vi.spyOn(window, "Image").mockImplementation(() => mockImage as any);
      const pngPromise = imageToPng(mockFile);

      expect(mockURL.createObjectURL).toHaveBeenCalledWith(mockFile);
      mockImage.onerror(new Error("Image load failed"));

      await expect(pngPromise).rejects.toThrow("Image load failed");
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });
});
