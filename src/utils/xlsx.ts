import path from "path";
import * as xlsx from "node-xlsx";
import fs from "fs";

if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const DIR_NAME = process.env.DIR_NAME || "exports";

export function createXlSXfile(option: {
  data: any[][];
  fileName: string;
  title: string;
}) {
  let data = option.data;
  data.unshift([option.title.toUpperCase()], []);
  const range = { s: { c: 0, r: 0 }, e: { c: data[3].length - 1, r: 0 } };
  const XLSXOption = { "!merges": [range] };

  const buffer = xlsx.build(
    [{ data: option.data, name: "Report " }],
    XLSXOption
  );

  fs.writeFileSync(path.resolve(DIR_NAME, `${option.fileName}.xlsx`), buffer, {
    flag: "w+"
  });
  console.log("Export XLSX Done !");
}
