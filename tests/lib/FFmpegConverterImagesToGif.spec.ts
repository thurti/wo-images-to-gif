import { FFmpegConverter } from "@/lib/FFmpegConverter";
import { FFmpegConverterImagesToGif } from "@/lib/FFmpegConverterImagesToGif";
import {
  getImageDimensions,
  getMaxImageDimensions,
  imageToPng,
} from "@/lib/utils/image";
import { fetchFile } from "@ffmpeg/util";
import { describe } from "vitest";

const loadSpy = vi.fn();
const execSpy = vi.fn();
const terminateSpy = vi.fn();
const onSpy = vi.fn();
const writeFileSpy = vi.fn();
const deleteFile = vi.fn();
const readFileSpy = vi.fn();

vi.mock("@/lib/utils/image", () => ({
  imageToPng: vi.fn((file) => file),
  getImageDimensions: vi.fn(() => ({ width: 100, height: 100 })),
  getMaxImageDimensions: vi.fn(() => ({ width: 100, height: 100 })),
}));

vi.mock("@ffmpeg/ffmpeg", () => {
  const FFmpeg = vi.fn(() => ({
    load: loadSpy,
    exec: execSpy,
    terminate: terminateSpy,
    on: onSpy,
    writeFile: writeFileSpy,
    deleteFile: deleteFile,
    readFile: readFileSpy,
    loaded: true,
  }));
  return { FFmpeg };
});

vi.mock("@ffmpeg/util", () => ({
  fetchFile: vi.fn(),
}));

const myFiles = [
  new File([""], "test.png", { type: "image/png" }),
  new File([""], "test1.png", { type: "image/png" }),
  new File([""], "asd.png", { type: "image/png" }),
];

const progress = {
  set: vi.fn(),
} as any;

const logger = {
  update: vi.fn(),
} as any;

let converter: FFmpegConverterImagesToGif;

describe("lib/FFmpegConverterImagesToGif", () => {
  beforeEach(async () => {
    converter = new FFmpegConverterImagesToGif(progress, logger);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("#constructor()", () => {
    it("should create a new instance and set props", async () => {
      expect(converter).toBeInstanceOf(FFmpegConverterImagesToGif);
      expect(converter).toBeInstanceOf(FFmpegConverter);
      expect(converter.progress).toBe(progress);
      expect(converter.logger).toBe(logger);
    });
  });

  describe("#setFiles()", async () => {
    it("should set files with new indexed filenames", async () => {
      await converter.setFiles(myFiles);

      expect(converter.files).toEqual(
        new Map([
          ["test_1.png", myFiles[0]],
          ["test_2.png", myFiles[1]],
          ["test_3.png", myFiles[2]],
        ]),
      );
    });

    it("should convert all images to png", async () => {
      await converter.setFiles(myFiles);

      expect(imageToPng).toHaveBeenCalledWith(myFiles[0]);
      expect(imageToPng).toHaveBeenCalledWith(myFiles[1]);
      expect(imageToPng).toHaveBeenCalledWith(myFiles[2]);
    });

    it("should write to wasm with filename set to file[0].name%d.[ext]", async () => {
      fetchFile.mockResolvedValue(new Uint8Array([1, 2, 3]));

      await converter.init();
      await converter.setFiles(myFiles);

      expect(writeFileSpy).toHaveBeenNthCalledWith(
        1,
        "test_1.png",
        new Uint8Array([1, 2, 3]),
      );

      expect(writeFileSpy).toHaveBeenNthCalledWith(
        2,
        "test_2.png",
        new Uint8Array([1, 2, 3]),
      );

      expect(writeFileSpy).toHaveBeenNthCalledWith(
        3,
        "test_3.png",
        new Uint8Array([1, 2, 3]),
      );
    });

    it("should delete old files from wasm", async () => {
      fetchFile.mockResolvedValue(new Uint8Array([1, 2, 3]));

      await converter.init();
      await converter.setFiles(myFiles);
      await converter.setFiles([]);

      expect(deleteFile).toHaveBeenCalledWith("test_1.png");
      expect(deleteFile).toHaveBeenCalledWith("test_2.png");
      expect(deleteFile).toHaveBeenCalledWith("test_3.png");
    });
  });

  describe("#convertImagesToMp4", async () => {
    it("should call ffmpeg with correct params", async () => {
      await converter.init();
      await converter.setFiles(myFiles);
      await converter.convertImagesToMp4(
        ["test_1.png", "test_2.png", "test_3.png"],
        1,
        "temp.mp4",
      );

      expect(execSpy).toHaveBeenCalledWith([
        "-framerate",
        "3",
        "-f",
        "image2",
        "-i",
        "test_%d.png",
        "-vf",
        "format=rgba,scale=w='if(gt(a,100/100),100,100*(iw/ih))':h='if(gt(a,100/100),100/(iw/ih),100)',crop=w='min(iw,100)':h='min(ih,100)':x='(iw-ow)/2':y='(ih-oh)/2',pad=w=100:h=100:x='(ow-iw)/2':y='(oh-ih)/2':color=ffffff00",
        "-c:v",
        "png",
        "-an",
        "temp.mp4",
      ]);
    });
  });

  describe("#convert()", async () => {
    it("should convert a file", async () => {
      fetchFile.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
      await converter.init();
      await converter.setFiles(myFiles);
      await converter.convert(
        {
          id: "gif",
          label: "gif",
          value: "gif",
          ext: "gif",
        },
        { fps: { id: "fps", label: "fps", value: "-fps 10" } },
      );
      expect(fetchFile).toHaveBeenCalledWith(myFiles[0]);
      expect(fetchFile).toHaveBeenCalledWith(myFiles[1]);
      expect(fetchFile).toHaveBeenCalledWith(myFiles[2]);
      expect(execSpy).toHaveBeenCalledWith([
        "-i",
        "temp.mp4",
        "-fps",
        "10",
        "test.gif",
      ]);
      expect(readFileSpy).toHaveBeenNthCalledWith(1, "test.gif");
    });
  });
});
