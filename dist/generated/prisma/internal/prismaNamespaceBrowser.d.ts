import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull);
};
export declare const DbNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const JsonNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const AnyNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const ModelName: {
    readonly InterviewContext: "InterviewContext";
    readonly InterviewSession: "InterviewSession";
    readonly TranscriptChunk: "TranscriptChunk";
    readonly SuggestedResponse: "SuggestedResponse";
    readonly SessionSummary: "SessionSummary";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const InterviewContextScalarFieldEnum: {
    readonly id: "id";
    readonly resumeText: "resumeText";
    readonly interviewType: "interviewType";
    readonly jobLevel: "jobLevel";
    readonly jobDescription: "jobDescription";
    readonly companyName: "companyName";
    readonly companySegment: "companySegment";
    readonly responsePreference: "responsePreference";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type InterviewContextScalarFieldEnum = (typeof InterviewContextScalarFieldEnum)[keyof typeof InterviewContextScalarFieldEnum];
export declare const InterviewSessionScalarFieldEnum: {
    readonly id: "id";
    readonly status: "status";
    readonly startedAt: "startedAt";
    readonly endedAt: "endedAt";
    readonly contextId: "contextId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type InterviewSessionScalarFieldEnum = (typeof InterviewSessionScalarFieldEnum)[keyof typeof InterviewSessionScalarFieldEnum];
export declare const TranscriptChunkScalarFieldEnum: {
    readonly id: "id";
    readonly sessionId: "sessionId";
    readonly sequence: "sequence";
    readonly content: "content";
    readonly source: "source";
    readonly createdAt: "createdAt";
};
export type TranscriptChunkScalarFieldEnum = (typeof TranscriptChunkScalarFieldEnum)[keyof typeof TranscriptChunkScalarFieldEnum];
export declare const SuggestedResponseScalarFieldEnum: {
    readonly id: "id";
    readonly sessionId: "sessionId";
    readonly detectedQuestion: "detectedQuestion";
    readonly suggestedAnswer: "suggestedAnswer";
    readonly shortVersion: "shortVersion";
    readonly keyPoints: "keyPoints";
    readonly strategicNote: "strategicNote";
    readonly createdAt: "createdAt";
};
export type SuggestedResponseScalarFieldEnum = (typeof SuggestedResponseScalarFieldEnum)[keyof typeof SuggestedResponseScalarFieldEnum];
export declare const SessionSummaryScalarFieldEnum: {
    readonly id: "id";
    readonly sessionId: "sessionId";
    readonly content: "content";
    readonly topics: "topics";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SessionSummaryScalarFieldEnum = (typeof SessionSummaryScalarFieldEnum)[keyof typeof SessionSummaryScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
