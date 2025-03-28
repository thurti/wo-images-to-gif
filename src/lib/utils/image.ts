export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    img.src = objectUrl;
  });
}

export async function getMaxImageDimensions(
  files: File[],
): Promise<{ width: number; height: number }> {
  const dimensions = await Promise.all(files.map(getImageDimensions));
  return dimensions.reduce(
    (max, current) => ({
      width: Math.max(max.width, current.width),
      height: Math.max(max.height, current.height),
    }),
    { width: 0, height: 0 },
  );
}

export async function imageToPng(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const filename = file.name.replace(/\.[^/.]+$/, ".png");
        resolve(
          new File([blob as Blob], filename, {
            type: "image/png",
          }),
        );
      });
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };

    img.src = objectUrl;
  });
}
