import { injectable } from "inversify";
import { DefinitionFileService } from "./definition-file.service";
import { DefinitionValidationService } from "./definition-validator.service";

const debug = require('debug')('ksac:definition:service');

@injectable()
export class DefinitionServices {
    constructor(
        private readonly fileService: DefinitionFileService,
        private readonly validationService: DefinitionValidationService,
    ) { }

    async getDefinitions() {
        debug('loading definition files');
        const files = await this.fileService.getDefinitionFiles();
        debug(`${files.length} definition files found, parsing`);
        const parsedFiles = await this.fileService.parseFiles(files);
        debug('definitions parsed, mapping content');
        const definitions = parsedFiles.map(f =>
            this.validationService.mapFileToDefinition(f));
        debug('content mapped, validating format');
        definitions.forEach(d =>
            this.validationService.validateDefinition(d));
        console.log(JSON.stringify(definitions, null, 2));
        debug('formats validated, merging files');
        // TODO
        debug('files merged, validating content');
        // TODO
        debug('content validated, done loading definitions');
        // TODO
    }
}
