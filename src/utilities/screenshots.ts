import html2canvas from 'html2canvas';
import { base64NoImageString } from '../constants/base64NoImageString';

export const takeScreenShot = async (): Promise<string> => {
  const canvas = await html2canvas(document.body);
  return canvas.toDataURL();
};

export const handleFailedScreenShot = (): string => base64NoImageString;
