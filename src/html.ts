import fs from 'fs';
import path from 'path';

import { emojify } from 'node-emoji';
import {
    organizeContractsStructure,
} from './organize';
import {
    renderLicense,
    renderReadme,
    transformTemplate,
} from './renderHTML';


const defaultTemplatePath = 'src/template/html/index.html';

/**
 * To write!
 * @param {object} contractsData Obect containing all contracts info
 */
export function generateDocumentation(contractsPreparedData: any, outputFolder: any) {
    // create a list of contracts and methods
    const contractsStructure = organizeContractsStructure(contractsPreparedData);
    const hasLICENSE = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    contractsPreparedData.forEach((contract: any) => {
        // transform the template
        let HTMLContent = transformTemplate(
            path.join(contract.currentFolder, defaultTemplatePath),
            contract.contractName,
            contract.contractData,
            contract.solidityFilePath,
            contractsStructure,
            hasLICENSE,
        );
        // transform damn weird URLS into real liks
        const match = HTMLContent.match(/(?<!\[)https?:&#x2F;&#x2F;[a-zA-Z0-9.&#x2F;\-_]+/g);
        if (match !== null) {
            let transform = match.map((url) => url.replace(/&#x2F;/g, '/'));
            transform = transform.map((url) => `<a href="${url}">${url}</a>`);
            for (let i = 0; i < match.length; i += 1) {
                HTMLContent = HTMLContent.replace(match[i], transform[i]);
            }
        }
        const formatEmojify = (code: any, name: any) => `<i alt="${code}" class="twa twa-${name}"></i>`;
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, `${contract.filename}.html`),
            emojify(HTMLContent, null as any, formatEmojify),
        );
    });
    // If there's a README...
    if (fs.existsSync(path.join(process.cwd(), 'README.md'))) {
        // insert into index.html
        const templateContent = String(fs.readFileSync(
            path.join(contractsPreparedData[0].currentFolder, defaultTemplatePath),
        ));
        const outputReadme = renderReadme(templateContent, contractsStructure, hasLICENSE);
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, 'index.html'),
            outputReadme,
        );
        // if there's an image reference in readme, copy it
        const files: any = [];
        // read dir
        const filesList = fs.readdirSync(process.cwd());
        // iterate over what was found
        filesList.forEach((file) => {
            const stats = fs.lstatSync(path.join(process.cwd(), file));
            // if not, push file to list, only if it is valid
            if (stats.isFile() && path.extname(file) === '.png') {
                files.push(file);
            }
        });
        // and if the file is n readme, copy it
        files.forEach((file: any) => {
            if (outputReadme.includes(file)) {
                fs.copyFileSync(path.join(process.cwd(), file), path.join(process.cwd(), outputFolder, file));
            }
        });
    }
    // If there's a LICENSE
    if (hasLICENSE) {
        // insert into index.html
        const templateContent = String(fs.readFileSync(
            path.join(contractsPreparedData[0].currentFolder, defaultTemplatePath),
        ));
        const outputLicense = renderLicense(templateContent, contractsStructure);
        // write it to a file
        fs.writeFileSync(
            path.join(process.cwd(), outputFolder, 'license.html'),
            outputLicense,
        );
    }
    return 0;
}
