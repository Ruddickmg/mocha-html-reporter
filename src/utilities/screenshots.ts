import html2canvas from 'html2canvas';
import { base64NoImageString } from "../constants/base64NoImageString";

export const takeScreenShot = async (): Promise<string> => new Promise(async (resolve, reject) => {
  try {
    resolve((await html2canvas(document.body)).toDataURL());
  } catch (error) {
    reject(error);
  }
});

export const handleFailedScreenShot = (): Promise<string> => Promise.resolve(base64NoImageString);
