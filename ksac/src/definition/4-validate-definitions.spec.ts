import 'reflect-metadata';
import { parse } from 'hcl-parser';
import { DefinitionValidationService } from './definition-validator.service';
import { DefinitionMapperService } from './definition-mapper.service';

const fileFactory = (hcl: string) => ({
    name: 'file1.hcl',
    content: parse(hcl)[0],
});

describe('ksac validate - step 4: Validate Definitions', () => {
    let mapper: DefinitionMapperService;
    let service: DefinitionValidationService;

    beforeEach(() => {
        service = new DefinitionValidationService();
        mapper = new DefinitionMapperService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('DefinitionValidationService#validateDefinition', () => {
        it('should accept full definitions', async () => {
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

            expect(() => service.validateDefinition(rawDefinition)).not.toThrow();
        });

        it('should accept minimal KOs', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).not.toThrow();
        });

        it('should accept minimal KSs', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).not.toThrow();
        });

        it('should reject missing KO content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject missing KS name', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject missing KS description', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject empty KS slug', async () => {
            const hcl = `
                knowledge_source "" {
                    name = "Name"
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject empty KO slug', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "" {
                        content = "content"
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject non-string KS name', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = 123
                    description = "Description"
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject non-string KS description', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = 123
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject non-string KO content', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = 123
                        language = "javascript"
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject non-string KO language', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = 123
                        use_cases = ["uc1", "uc2"]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject non-array KO use cases', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                        use_cases = "uc1"
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });

        it('should reject non-string KO use cases', async () => {
            const hcl = `
                knowledge_source "ks-slug" {
                    name = "Name"
                    description = "Description"

                    knowledge_object "ko-slug" {
                        content = "content"
                        language = "javascript"
                        use_cases = [123, 456]
                    }
                }
            `;
            const file = fileFactory(hcl);
            const rawDefinition = mapper.mapFileToRawDefinition(file);

            expect(() => service.validateDefinition(rawDefinition)).toThrow();
        });
    });
});
