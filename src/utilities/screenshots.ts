import html2canvas from 'html2canvas';
import { base64NoImageString } from "./base64NoImageString";

export const takeScreenShot = (): Promise<string> => new Promise((resolve, reject) => {
  try {
    html2canvas(document.body)
      .then((canvas: HTMLCanvasElement): any => resolve(canvas.toDataURL()));
  } catch (error) {
    reject(error);
  }
});

export const handleFailedScreenShot = (): Promise<string> => Promise.resolve(base64NoImageString);
