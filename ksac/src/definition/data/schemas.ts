import * as Joi from 'joi';

export const rawKnowledgeObjectSchema = Joi.object({
    slug: Joi.string().required(),
    useCases: Joi.array().items(Joi.string()).required(),
    language: Joi.string().required(),
    content: Joi.string(),
    importFile: Joi.string(),
}).xor('content', 'importFile');

export const rawKnowledgeSourceSchema = Joi.object({
    slug: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    knowledgeObjects: Joi.array().items(rawKnowledgeObjectSchema).required(),
    fileName: Joi.string().required(),
});

export const rawDefinitionSchema = Joi.object({
    knowledgeSources: Joi.array().items(rawKnowledgeSourceSchema).required(),
    fileName: Joi.string().required(),
});
