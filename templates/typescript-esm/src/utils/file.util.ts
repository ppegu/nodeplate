import fs from "fs";
import path from "path";
import { promisify } from "util";
import Logger from "./Logger";

const logger = Logger.createLogger("file.util");

export const mkdir = promisify(fs.mkdir);
export const unlink = promisify(fs.unlink);
export const stat = promisify(fs.stat);

/**
 * Converts a file size from one unit to another.
 *
 * @param value - The file size to convert.
 * @param {"B" | "KB" | "MB" | "GB" | "TB"} fromUnit - The unit of the input file size. Valid units are 'B', 'KB', 'MB', 'GB', 'TB'.
 * @param {"B" | "KB" | "MB" | "GB" | "TB"} toUnit - The unit to convert the file size to. Valid units are 'B', 'KB', 'MB', 'GB', 'TB'.
 * @returns The converted file size in the target unit.
 * @throws Will throw an error if the provided units are invalid.
 */
export function convertFileSize(
  value: number,
  fromUnit: "B" | "KB" | "MB" | "GB" | "TB",
  toUnit: "B" | "KB" | "MB" | "GB" | "TB"
): number {
  const units = ["B", "KB", "MB", "GB", "TB"];
  const fromIndex = units.indexOf(fromUnit.toUpperCase());
  const toIndex = units.indexOf(toUnit.toUpperCase());

  if (fromIndex === -1 || toIndex === -1) {
    logger.error("Invalid unit");
    return 0;
  }

  const conversionFactor = Math.pow(1024, fromIndex - toIndex);
  return value * conversionFactor;
}

export function waitForFileToReachSize(
  filePath: string,
  requiredSize: number,
  timeout: number
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    logger.log("Watching file size to reach:", requiredSize);

    let timer: NodeJS.Timeout | null = null;

    const checkFileSize: fs.StatsListener = (curr, _prev) => {
      if (curr.size >= requiredSize) {
        fs.unwatchFile(filePath);
        if (timer) clearTimeout(timer);
        resolve(curr.size);
      }
    };

    fs.watchFile(filePath, checkFileSize);

    timer = setTimeout(() => {
      fs.unwatchFile(filePath);
      reject(
        new Error("File size did not reach the required content length in time")
      );
    }, timeout);
  });
}

export function ensureDirectoryExists(downloadDir: string) {
  if (!fs.existsSync(downloadDir)) {
    const dirPath = path.dirname(downloadDir);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
