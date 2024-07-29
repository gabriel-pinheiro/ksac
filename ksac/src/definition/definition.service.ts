import { injectable } from 'inversify';
import { DefinitionFileService } from './definition-file.service';
import { DefinitionValidationService } from './definition-validator.service';
import { DefinitionFileValidatorService } from './definition-file-validator.service';
import { Definition } from './data/models';
import { DefinitionMapperService } from './definition-mapper.service';
import { DefinitionEnricherService } from './definition-enricher.service';

const debug = require('debug')('ksac:definition:service');

@injectable()
export class DefinitionServices {
    constructor(
        private readonly fileService: DefinitionFileService,
        private readonly fileValidatorService: DefinitionFileValidatorService,
        private readonly mapperService: DefinitionMapperService,
        private readonly validationService: DefinitionValidationService,
        private readonly enricherService: DefinitionEnricherService,
    ) {}

    async getDefinitions(): Promise<Definition> {
        debug('scanning files');
        const files = await this.fileService.scanFiles();

        debug(`${files.length} definition files found, parsing`);
        const parsedFiles = await this.fileService.parseFiles(files);

        debug('files parsed, validating file format');
        parsedFiles.forEach((f) =>
            this.fileValidatorService.validateFileFormat(f),
        );

        debug('files validated, mapping definitions');
        const rawDefinitions = parsedFiles.map((f) =>
            this.mapperService.mapFileToRawDefinition(f),
        );

        debug('definitions mapped, validating definitions');
        rawDefinitions.forEach((d) =>
            this.validationService.validateDefinition(d),
        );

        debug('definitions validated, enriching definitions');
        const definitions =
            await this.enricherService.enrichDefinitions(rawDefinitions);

        debug('definitions enriched, merging definitions');
        const merged = this.mapperService.mergeDefinitions(definitions);

        debug('definitions merged, validating content');
        this.validationService.validateContent(merged);

        debug('content validated, done loading definitions');
        return merged;
    }
}
