import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { DefinitionMapperService } from './definition-mapper.service';
import { DefinitionEnricherService } from './definition-enricher.service';
import { Definition } from './data/models';

const fileFactory = (hcl: string) => ({
    name: 'file1.hcl',
    content: parse(hcl)[0],
});

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
    });
});
