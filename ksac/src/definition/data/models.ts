export type FileOrDir = {
    name: string,
    isDir: boolean,
};

export type DefinitionFile = {
    name: string,
    content: any,
};

export type RawKnowledgeObject = {
    slug: string,
    useCases: string[],
    language: string,
    content?: string,
    importFile?: string,
};

export type RawKnowledgeSource = {
    slug: string,
    name: string,
    description: string,
    knowledgeObjects: RawKnowledgeObject[],
    fileName: string,
};

export type RawDefinition = {
    knowledgeSources: RawKnowledgeSource[],
    fileName: string,
};


export type KnowledgeObject = {
    slug: string,
    useCases: string,
    language: string,
    content: string,
};

export type KnowledgeSource = {
    slug: string,
    name: string,
    description: string,
    knowledgeObjects: KnowledgeObject[],
    fileName: string,
};

export type Definition = {
    knowledgeSources: KnowledgeSource[],
};
