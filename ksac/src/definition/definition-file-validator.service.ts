import { injectable } from "inversify";
import { CommandError } from "../command/command.error";
import { DefinitionFile } from "./data/models";

const debug = require('debug')('ksac:definition-file-validator:service');


@injectable()
export class DefinitionFileValidatorService {

    /**
     * Receives the DefinitionFiles containing the raw content
     * parsed by the HCL lib.
     *
     * This validates the file format for the first mapping step,
     * which will convert the files to the internal definition format
     * to be validated further.
     */
    validateFileFormat(file: DefinitionFile) {
        debug(`validating file format in file '${file.name}'`);
        this.validateFileIsObject(file);
        this.validateFileKSFormat(file);

        if (!file.content.knowledge_source) {
            return;
        }

        file.content.knowledge_source.forEach(ks =>
            this.validateFileOneKS(ks, file.name));

    }

    /**
     * Validates if the file content is an object, not a literal
     * or array, etc.
     */
    private validateFileIsObject(file: DefinitionFile) {
        if (typeof file.content === 'object') {
            return;
        }

        throw new CommandError(`File '${file.name}' is not a valid object`);
    }

    /**
     * Validates the HCL root format, and if knowledge_sources are
     * the only stanza present in the root level.
     */
    private validateFileKSFormat(file: DefinitionFile) {
        const wrongKeys = Object.keys(file.content)
            .filter(key => key !== 'knowledge_source');
        if (wrongKeys.length) {
            throw new CommandError(`File '${file.name}' contains invalid keys: ${wrongKeys.join(', ')}`);
        }

        if (!file.content.hasOwnProperty('knowledge_source')) {
            return;
        }

        if (!Array.isArray(file.content.knowledge_source)) {
            throw new CommandError(`'knowledge_source' in file '${file.name}' is not a named object, invalid format`);
        }
    }

    /**
     * Validates a knowledge_source in the raw parsed file
     */
    private validateFileOneKS(ks: any, fileName: string) {
        this.validateFileOneKSSingleKey(ks, fileName);
        const slug = Object.keys(ks)[0];
        const sources = ks[slug];
        this.validateFileOneKSSources(sources, slug, fileName);
        const source = sources[0];

        if (!source.knowledge_object) {
            return;
        }

        if (!Array.isArray(source.knowledge_object)) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' contains an invalid Knowledge Object`);
        }

        source.knowledge_object.forEach(ko =>
            this.validateFileKO(ko, slug, fileName));
    }

    /**
     * HCL stanzas come in key-value maps, making sure each KS
     * has only one key.
     */
    private validateFileOneKSSingleKey(obj: any, fileName: string) {
        if (Object.keys(obj).length === 1) {
            return;
        }

        throw new CommandError(`File '${fileName}' contains an invalid Knowledge Source. Make sure it has a slug`);
    }

    /**
     * Validates the knowledge_source stanza format, and if it's
     * the only stanza present in the root level.
     */
    private validateFileOneKSSources(sources: any[], slug: string, fileName: string) {
        if (!Array.isArray(sources)) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' is not a named object, invalid format`);
        }

        if (sources.length === 0) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' is empty`);
        }

        if (sources.length > 1) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' is duplicated`);
        }
    }
    /**
     * Validates a knowledge_object in the raw parsed file
     */
    private validateFileKO(ko: any, ksSlug: string, fileName: string) {
        this.validateFileKOSingleKey(ko, ksSlug, fileName);
        const slug = Object.keys(ko)[0];
        const objects = ko[slug];
        this.validateFileKOObjects(objects, slug, ksSlug, fileName);
    }

    /**
     * HCL stanzas come in key-value maps, making sure each KO
     * has only one key.
     */
    private validateFileKOSingleKey(obj: any, ksSlug: string, fileName: string) {
        if (Object.keys(obj).length === 1) {
            return;
        }

        throw new CommandError(`Knowledge Source '${ksSlug}' in file '${fileName}' contains an invalid Knowledge Object. Make sure it has a slug`);
    }

    /**
     * Validates the knowledge_object stanza format
     */
    private validateFileKOObjects(objects: any[], slug: string, ksSlug: string, fileName: string) {
        if (!Array.isArray(objects)) {
            throw new CommandError(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is not a named object, invalid format`);
        }

        if (objects.length === 0) {
            throw new CommandError(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is empty`);
        }

        if (objects.length > 1) {
            throw new CommandError(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is duplicated`);
        }
    }
}
