import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { DefinitionMapperService } from './definition-mapper.service';
import { DefinitionEnricherService } from './definition-enricher.service';
import { Definition } from './data/models';
import { promises } from 'fs';
import { CommandError } from '../command/command.error';

const { readFile } = promises;

const fileFactory = (hcl: string) => ({
    name: 'file1.hcl',
    content: parse(hcl)[0],
});

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
    },
}));

describe('ksac validate - step 5: Enrich Definitions', () => {
    let mapper: DefinitionMapperService;
    let service: DefinitionEnricherService;

    beforeEach(() => {
        service = new DefinitionEnricherService();
        mapper = new DefinitionMapperService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionEnricherService#enrichDefinitions', () => {
        it('should enrich full definitions', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await service.enrichDefinitions([rawDefinition]);

            expect(definition).toMatchObject({
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: 'uc1\nuc2',
                        language: 'javascript',
                    }],
                }],
            } as Definition);
        });

        it('should enrich missing use cases', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await service.enrichDefinitions([rawDefinition]);

            expect(definition).toMatchObject({
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: '',
                        language: 'javascript',
                    }]
                }],
            });
        });

        it('should enrich empty KSs', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await service.enrichDefinitions([rawDefinition]);

            expect(definition).toMatchObject({
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [],
                }],
            });
        });

        it('should trim content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = " content "
                        language = "javascript"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);
            const [definition] = await service.enrichDefinitions([rawDefinition]);

            expect(definition).toMatchObject({
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'content',
                        useCases: '',
                    }],
                }],
            });
        });

        it('should import content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        import_file = "file.md"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            (readFile as jest.Mock).mockResolvedValue('external content');

            const [definition] = await service.enrichDefinitions([rawDefinition]);

            expect(definition).toMatchObject({
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'external content',
                        useCases: '',
                    }],
                }],
            });
        });

        it('should trim imported content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        import_file = "file.md"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            (readFile as jest.Mock).mockResolvedValue(' external content ');

            const [definition] = await service.enrichDefinitions([rawDefinition]);

            expect(definition).toMatchObject({
                knowledgeSources: [{
                    slug: 'ks-slug',
                    fileName: 'file1.hcl',
                    name: 'Name',
                    description: 'Description',
                    knowledgeObjects: [{
                        slug: 'ko-slug',
                        content: 'external content',
                        useCases: '',
                    }],
                }],
            });
        });

        it('should return CommandError if reading file fails', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        import_file = "file.md"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            (readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

            await expect(service.enrichDefinitions([rawDefinition])).rejects.toThrow(CommandError);
        });
    });
});
