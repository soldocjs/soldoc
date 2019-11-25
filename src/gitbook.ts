import fs from 'fs';
import path from 'path';
import {
    organizeContractsStructure,
} from './organize';
import {
    renderContracts,
    renderDocumentationIndex,
    renderReadme,
} from './renderMD';

const lineBreak = '\r\n';

/**
 * @param contractsPreparedData prepared data
 */
export function generateDocumentation(contractsPreparedData: any, outputFolder: any) {
    // create a list of contracts and methods
    const contractsStructure = organizeContractsStructure(contractsPreparedData);
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    renderContracts(contractsPreparedData, outputFolder, lineBreak);
    // generate summary file (essential in gitbook)
    let SUMMARYContent = `# Summary\r\n* WELCOME${lineBreak}`;
    SUMMARYContent = renderDocumentationIndex(
        SUMMARYContent, outputFolder, contractsStructure, hasLICENSE, lineBreak,
    );
    // create summary file
    fs.writeFileSync(
        path.join(process.cwd(), outputFolder, 'SUMMARY.md'),
        SUMMARYContent,
    );
    // Copy readme if it exists, otherwise, create a sampe
    renderReadme(outputFolder);
}
