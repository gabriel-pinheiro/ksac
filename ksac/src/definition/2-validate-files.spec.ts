import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { CommandError } from '../command/command.error';
import { DefinitionFileValidatorService } from './definition-file-validator.service';

const fileFactory = (hcl: string) => ({
    name: 'file1.hcl',
    content: parse(hcl)[0],
});

describe('ksac validate - step 2: Validate Files', () => {
    let service: DefinitionFileValidatorService;

    beforeEach(() => {
        service = new DefinitionFileValidatorService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionFileValidatorService#validateFileFormat', () => {
        it('should not accept non-object contents', async () => {
            const file = {
                name: 'file1.hcl',
                content: 'test',
            };
            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should not accept non-object KSs', async () => {
            const hcl = `
                knowledge_source = ["source"]
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should not accept non-array KSs', async () => {
            const hcl = `
                knowledge_source = "source"
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should not accept wrong root keys', async () => {
            const hcl = `
                wrong_key = "value"
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should not accept non-array KSs', async () => {
            const hcl = `
                knowledge_source = {}
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should accept empty files', async () => {
            const hcl = ``;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).not.toThrow();
        });

        it('should not accept unnamed KSs', async () => {
            const hcl = `
                knowledge_source {
                    name = "source"
                    description = "description"
                }
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should accept valid KSs without KOs', async () => {
            const hcl = `
                knowledge_source "slug" {
                    name = "Name"
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).not.toThrow();
        });

        it('should not accept unnamed KOs', async () => {
            const hcl = `
                knowledge_source "slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object {
                        content = "content"
                        language = "markdown"
                    }
                }
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should not accept wrong KO type', async () => {
            const hcl = `
                knowledge_source "slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object = "test"
                }
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should not accept KO empty object', async () => {
            const hcl = `
                knowledge_source "slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object = {}
                }
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).toThrow(CommandError);
        });

        it('should accept valid KOs', async () => {
            const hcl = `
                knowledge_source "slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "name" {
                        content = "content"
                        language = "markdown"
                    }
                }
            `;
            const file = fileFactory(hcl);

            expect(() => service.validateFileFormat(file)).not.toThrow();
        });
    });
});
