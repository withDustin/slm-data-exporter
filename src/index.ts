import {processData} from "./services";
import fs from "fs";
import path from "path";
import {createXlSXfile} from "./utils/xlsx";
// import {}
if (process.env.NODE_ENV === 'development') {
    require('dotenv').config()
}

(async () => {
    const dir = path.join(__dirname, `/exportData/`)

    if (!fs.existsSync(dir)) {
        await fs.mkdirSync(dir, {recursive: false})
    }
     const data = await processData();
    createXlSXfile({data, dirName: 'src/exportData'})
})();





