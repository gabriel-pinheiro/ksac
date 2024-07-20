import 'reflect-metadata';
import 'colors';
import { parse } from 'hcl-parser';
import { promises, read } from "fs";
import { Definition, DefinitionValidationService } from './definition-validator.service';
import { CommandError } from '../command/command.error';

const { readFile } = promises;

const FILE_PREFIX = './test/data/definition-validator/';

async function readHcl(path: string) {
    const data = await readFile(FILE_PREFIX + path);
    const [content, _error] = parse(data.toString());
    return {
        name: 'file.hcl',
        content,
    };
}

async function readJson(path: string) {
    const data = await readFile(FILE_PREFIX + path);
    return JSON.parse(data.toString());
}

describe('DefinitionValidationService', () => {
    let service: DefinitionValidationService;

    beforeEach(() => {
        service = new DefinitionValidationService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateDefinition', () => {
        it('should validate a correct definition', () => {
            const definition: Definition = {
                knowledgeSources: [
                    {
                        slug: 'source1',
                        name: 'Source 1',
                        description: 'Description 1',
                        knowledgeObjects: [
                            {
                                slug: 'object1',
                                useCases: ['useCase1'],
                                language: 'markdown',
                                content: 'Content 1',
                            },
                        ],
                        fileName: 'file1',
                    },
                ],
                fileName: 'file1',
            };

            expect(() => service.validateDefinition(definition)).not.toThrow();
        });

        it('should throw an error for an invalid definition', () => {
            const definition: Definition = {
                knowledgeSources: [
                    {
                        slug: '',
                        name: 'Source 1',
                        description: 'Description 1',
                        knowledgeObjects: [
                            {
                                slug: 'object1',
                                useCases: ['useCase1'],
                                language: 'markdown',
                                content: 'Content 1',
                            },
                        ],
                        fileName: 'file1',
                    },
                ],
                fileName: 'file1',
            };

            expect(() => service.validateDefinition(definition)).toThrow(CommandError);
        });
    });

    describe('mapFileToDefinition', () => {
        it('should map full definitions', async () => {
            const file = await readHcl('full-definition.hcl');
            const expectedDefinition = await readJson('full-definition.json');

            const actualDefinition = service.mapFileToDefinition(file);

            expect(actualDefinition).toEqual(expectedDefinition);
        });

        it('should map missing KO definitions', async () => {
            const file = await readHcl('missing-kos.hcl');
            const expectedDefinition = await readJson('missing-kos.json');

            const actualDefinition = service.mapFileToDefinition(file);

            expect(actualDefinition).toEqual(expectedDefinition);
        });

        it('should map missing KO use cases', async () => {
            const file = await readHcl('missing-use-cases.hcl');
            const expectedDefinition = await readJson('missing-use-cases.json');

            const actualDefinition = service.mapFileToDefinition(file);

            expect(actualDefinition).toEqual(expectedDefinition);
        });

        it('should map missing KO language', async () => {
            const file = await readHcl('missing-language.hcl');
            const expectedDefinition = await readJson('missing-language.json');

            const actualDefinition = service.mapFileToDefinition(file);

            expect(actualDefinition).toEqual(expectedDefinition);
        });

        it('should map empty files', async () => {
            const file = await readHcl('empty.hcl');
            const expectedDefinition = await readJson('empty.json');

            const actualDefinition = service.mapFileToDefinition(file);

            expect(actualDefinition).toEqual(expectedDefinition);
        });

        it('should not map invalid keys', async () => {
            const file = await readHcl('invalid-keys.hcl');

            expect(() => service.mapFileToDefinition(file)).toThrow(CommandError);
        });

        it('should not map invalid KS type', async () => {
            const file = await readHcl('invalid-type.hcl');

            expect(() => service.mapFileToDefinition(file)).toThrow(CommandError);
        });

        it('should not map missing KO content', async () => {
            const file = await readHcl('missing-ko-content.hcl');
            const definition = await service.mapFileToDefinition(file);

            expect(() => service.validateDefinition(definition)).toThrow(CommandError);
        });

        it('should not map missing KS name', async () => {
            const file = await readHcl('missing-ks-name.hcl');
            const definition = await service.mapFileToDefinition(file);

            expect(() => service.validateDefinition(definition)).toThrow(CommandError);
        });

        it('should not map missing KS description', async () => {
            const file = await readHcl('missing-ks-description.hcl');
            const definition = await service.mapFileToDefinition(file);

            expect(() => service.validateDefinition(definition)).toThrow(CommandError);
        });
    });
});
