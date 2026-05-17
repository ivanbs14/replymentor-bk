import * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Metrics = runtime.Metrics;
export type Metric<T> = runtime.Metric<T>;
export type MetricHistogram = runtime.MetricHistogram;
export type MetricHistogramBucket = runtime.MetricHistogramBucket;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
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
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly InterviewContext: "InterviewContext";
    readonly InterviewSession: "InterviewSession";
    readonly TranscriptChunk: "TranscriptChunk";
    readonly SuggestedResponse: "SuggestedResponse";
    readonly SessionSummary: "SessionSummary";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "interviewContext" | "interviewSession" | "transcriptChunk" | "suggestedResponse" | "sessionSummary";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        InterviewContext: {
            payload: Prisma.$InterviewContextPayload<ExtArgs>;
            fields: Prisma.InterviewContextFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.InterviewContextFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.InterviewContextFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>;
                };
                findFirst: {
                    args: Prisma.InterviewContextFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.InterviewContextFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>;
                };
                findMany: {
                    args: Prisma.InterviewContextFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>[];
                };
                create: {
                    args: Prisma.InterviewContextCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>;
                };
                createMany: {
                    args: Prisma.InterviewContextCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.InterviewContextCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>[];
                };
                delete: {
                    args: Prisma.InterviewContextDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>;
                };
                update: {
                    args: Prisma.InterviewContextUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>;
                };
                deleteMany: {
                    args: Prisma.InterviewContextDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.InterviewContextUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.InterviewContextUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>[];
                };
                upsert: {
                    args: Prisma.InterviewContextUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewContextPayload>;
                };
                aggregate: {
                    args: Prisma.InterviewContextAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateInterviewContext>;
                };
                groupBy: {
                    args: Prisma.InterviewContextGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.InterviewContextGroupByOutputType>[];
                };
                count: {
                    args: Prisma.InterviewContextCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.InterviewContextCountAggregateOutputType> | number;
                };
            };
        };
        InterviewSession: {
            payload: Prisma.$InterviewSessionPayload<ExtArgs>;
            fields: Prisma.InterviewSessionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.InterviewSessionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.InterviewSessionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>;
                };
                findFirst: {
                    args: Prisma.InterviewSessionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.InterviewSessionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>;
                };
                findMany: {
                    args: Prisma.InterviewSessionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[];
                };
                create: {
                    args: Prisma.InterviewSessionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>;
                };
                createMany: {
                    args: Prisma.InterviewSessionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.InterviewSessionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[];
                };
                delete: {
                    args: Prisma.InterviewSessionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>;
                };
                update: {
                    args: Prisma.InterviewSessionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>;
                };
                deleteMany: {
                    args: Prisma.InterviewSessionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.InterviewSessionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.InterviewSessionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>[];
                };
                upsert: {
                    args: Prisma.InterviewSessionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$InterviewSessionPayload>;
                };
                aggregate: {
                    args: Prisma.InterviewSessionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateInterviewSession>;
                };
                groupBy: {
                    args: Prisma.InterviewSessionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.InterviewSessionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.InterviewSessionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.InterviewSessionCountAggregateOutputType> | number;
                };
            };
        };
        TranscriptChunk: {
            payload: Prisma.$TranscriptChunkPayload<ExtArgs>;
            fields: Prisma.TranscriptChunkFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TranscriptChunkFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TranscriptChunkFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>;
                };
                findFirst: {
                    args: Prisma.TranscriptChunkFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TranscriptChunkFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>;
                };
                findMany: {
                    args: Prisma.TranscriptChunkFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>[];
                };
                create: {
                    args: Prisma.TranscriptChunkCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>;
                };
                createMany: {
                    args: Prisma.TranscriptChunkCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TranscriptChunkCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>[];
                };
                delete: {
                    args: Prisma.TranscriptChunkDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>;
                };
                update: {
                    args: Prisma.TranscriptChunkUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>;
                };
                deleteMany: {
                    args: Prisma.TranscriptChunkDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TranscriptChunkUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TranscriptChunkUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>[];
                };
                upsert: {
                    args: Prisma.TranscriptChunkUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TranscriptChunkPayload>;
                };
                aggregate: {
                    args: Prisma.TranscriptChunkAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTranscriptChunk>;
                };
                groupBy: {
                    args: Prisma.TranscriptChunkGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TranscriptChunkGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TranscriptChunkCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TranscriptChunkCountAggregateOutputType> | number;
                };
            };
        };
        SuggestedResponse: {
            payload: Prisma.$SuggestedResponsePayload<ExtArgs>;
            fields: Prisma.SuggestedResponseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SuggestedResponseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SuggestedResponseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>;
                };
                findFirst: {
                    args: Prisma.SuggestedResponseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SuggestedResponseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>;
                };
                findMany: {
                    args: Prisma.SuggestedResponseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>[];
                };
                create: {
                    args: Prisma.SuggestedResponseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>;
                };
                createMany: {
                    args: Prisma.SuggestedResponseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SuggestedResponseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>[];
                };
                delete: {
                    args: Prisma.SuggestedResponseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>;
                };
                update: {
                    args: Prisma.SuggestedResponseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>;
                };
                deleteMany: {
                    args: Prisma.SuggestedResponseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SuggestedResponseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SuggestedResponseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>[];
                };
                upsert: {
                    args: Prisma.SuggestedResponseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestedResponsePayload>;
                };
                aggregate: {
                    args: Prisma.SuggestedResponseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSuggestedResponse>;
                };
                groupBy: {
                    args: Prisma.SuggestedResponseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SuggestedResponseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SuggestedResponseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SuggestedResponseCountAggregateOutputType> | number;
                };
            };
        };
        SessionSummary: {
            payload: Prisma.$SessionSummaryPayload<ExtArgs>;
            fields: Prisma.SessionSummaryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SessionSummaryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SessionSummaryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>;
                };
                findFirst: {
                    args: Prisma.SessionSummaryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SessionSummaryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>;
                };
                findMany: {
                    args: Prisma.SessionSummaryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>[];
                };
                create: {
                    args: Prisma.SessionSummaryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>;
                };
                createMany: {
                    args: Prisma.SessionSummaryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SessionSummaryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>[];
                };
                delete: {
                    args: Prisma.SessionSummaryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>;
                };
                update: {
                    args: Prisma.SessionSummaryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>;
                };
                deleteMany: {
                    args: Prisma.SessionSummaryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SessionSummaryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SessionSummaryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>[];
                };
                upsert: {
                    args: Prisma.SessionSummaryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionSummaryPayload>;
                };
                aggregate: {
                    args: Prisma.SessionSummaryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSessionSummary>;
                };
                groupBy: {
                    args: Prisma.SessionSummaryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessionSummaryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SessionSummaryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SessionSummaryCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
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
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SessionStatus'>;
export type ListEnumSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SessionStatus[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export type Datasource = {
    url?: string;
};
export type Datasources = {
    db?: Datasource;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export interface PrismaClientOptions {
    datasources?: Datasources;
    datasourceUrl?: string;
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    adapter?: runtime.SqlDriverAdapterFactory | null;
    omit?: GlobalOmitConfig;
}
export type GlobalOmitConfig = {
    interviewContext?: Prisma.InterviewContextOmit;
    interviewSession?: Prisma.InterviewSessionOmit;
    transcriptChunk?: Prisma.TranscriptChunkOmit;
    suggestedResponse?: Prisma.SuggestedResponseOmit;
    sessionSummary?: Prisma.SessionSummaryOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
