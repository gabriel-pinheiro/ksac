import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { DefinitionMapperService } from './definition-mapper.service';
import { DefinitionEnricherService } from './definition-enricher.service';
import { Definition } from './data/models';

const fileFactory = (hcl: string, name: string) => ({
    name, content: parse(hcl)[0],
});

describe('ksac validate - step 6: Merge Definitions', () => {
    let service: DefinitionMapperService;
    let enricher: DefinitionEnricherService;

    beforeEach(() => {
        enricher = new DefinitionEnricherService();
        service = new DefinitionMapperService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionMapperService#mergeDefinitions', () => {
        it('should merge KSs', async () => {
            const hcl1 = `
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const hcl2 = `
                knowledge_source "ks-slug-2" {
                    name = "Name 2"
                    description = "Description 2"
                }
            `;
            const file1 = fileFactory(hcl1, 'file1.hcl');
            const file2 = fileFactory(hcl2, 'file2.hcl');
            const rawDefinition1 = service.mapFileToRawDefinition(file1);
            const rawDefinition2 = service.mapFileToRawDefinition(file2);
            const [definition1] = await enricher.enrichDefinitions([rawDefinition1]);
            const [definition2] = await enricher.enrichDefinitions([rawDefinition2]);

            const merged = await service.mergeDefinitions([definition1, definition2]);
            const expected: Definition = {
                knowledgeSources: [
                    {
                        slug: 'ks-slug-1',
                        fileName: 'file1.hcl',
                        name: 'Name 1',
                        description: 'Description 1',
                        knowledgeObjects: [],
                    },
                    {
                        slug: 'ks-slug-2',
                        fileName: 'file2.hcl',
                        name: 'Name 2',
                        description: 'Description 2',
                        knowledgeObjects: [],
                    },
                ],
            };

            expect(merged).toMatchObject(expected);
        });

        it('should merge duplicated KSs', async () => {
            const hcl = `
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl, 'file1.hcl');
            const rawDefinition = service.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            const merged = await service.mergeDefinitions([definition, definition]);
            const expected: Definition = {
                knowledgeSources: [
                    {
                        slug: 'ks-slug-1',
                        fileName: 'file1.hcl',
                        name: 'Name 1',
                        description: 'Description 1',
                        knowledgeObjects: [],
                    },
                    {
                        slug: 'ks-slug-1',
                        fileName: 'file1.hcl',
                        name: 'Name 1',
                        description: 'Description 1',
                        knowledgeObjects: [],
                    },
                ],
            };

            expect(merged).toMatchObject(expected);
        });

        it('should merge single KS', async () => {
            const hcl = `
                knowledge_source "ks-slug-1" {
                    name = "Name 1"
                    description = "Description 1"
                }
            `;
            const file = fileFactory(hcl, 'file1.hcl');
            const rawDefinition = service.mapFileToRawDefinition(file);
            const [definition] = await enricher.enrichDefinitions([rawDefinition]);

            const merged = await service.mergeDefinitions([definition]);
            const expected: Definition = {
                knowledgeSources: [
                    {
                        slug: 'ks-slug-1',
                        fileName: 'file1.hcl',
                        name: 'Name 1',
                        description: 'Description 1',
                        knowledgeObjects: [],
                    },
                ],
            };

            expect(merged).toMatchObject(expected);
        });

        it('should merge empty KSs', async () => {
            const merged = await service.mergeDefinitions([]);
            const expected: Definition = {
                knowledgeSources: [],
            };

            expect(merged).toMatchObject(expected);
        });
    });
});
