declare module 'qrcode' {
  type Options = { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; margin?: number; width?: number; type?: 'svg' };
  const QRCode: {
    toDataURL(text: string, options?: Options): Promise<string>;
    toString(text: string, options?: Options): Promise<string>;
  };
  export default QRCode;
}
