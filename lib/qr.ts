import QRCode from 'qrcode';

export function generateQRCode(text: string, options?: {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}): Promise<string> {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(
      text,
      {
        width: options?.width || 200,
        margin: options?.margin || 2,
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#ffffff',
        },
      },
      (error, url) => {
        if (error) {
          reject(error);
        } else {
          resolve(url);
        }
      }
    );
  });
}
