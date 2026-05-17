import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TranscriptChunkModel = runtime.Types.Result.DefaultSelection<Prisma.$TranscriptChunkPayload>;
export type AggregateTranscriptChunk = {
    _count: TranscriptChunkCountAggregateOutputType | null;
    _avg: TranscriptChunkAvgAggregateOutputType | null;
    _sum: TranscriptChunkSumAggregateOutputType | null;
    _min: TranscriptChunkMinAggregateOutputType | null;
    _max: TranscriptChunkMaxAggregateOutputType | null;
};
export type TranscriptChunkAvgAggregateOutputType = {
    sequence: number | null;
};
export type TranscriptChunkSumAggregateOutputType = {
    sequence: number | null;
};
export type TranscriptChunkMinAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    sequence: number | null;
    content: string | null;
    source: string | null;
    createdAt: Date | null;
};
export type TranscriptChunkMaxAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    sequence: number | null;
    content: string | null;
    source: string | null;
    createdAt: Date | null;
};
export type TranscriptChunkCountAggregateOutputType = {
    id: number;
    sessionId: number;
    sequence: number;
    content: number;
    source: number;
    createdAt: number;
    _all: number;
};
export type TranscriptChunkAvgAggregateInputType = {
    sequence?: true;
};
export type TranscriptChunkSumAggregateInputType = {
    sequence?: true;
};
export type TranscriptChunkMinAggregateInputType = {
    id?: true;
    sessionId?: true;
    sequence?: true;
    content?: true;
    source?: true;
    createdAt?: true;
};
export type TranscriptChunkMaxAggregateInputType = {
    id?: true;
    sessionId?: true;
    sequence?: true;
    content?: true;
    source?: true;
    createdAt?: true;
};
export type TranscriptChunkCountAggregateInputType = {
    id?: true;
    sessionId?: true;
    sequence?: true;
    content?: true;
    source?: true;
    createdAt?: true;
    _all?: true;
};
export type TranscriptChunkAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TranscriptChunkWhereInput;
    orderBy?: Prisma.TranscriptChunkOrderByWithRelationInput | Prisma.TranscriptChunkOrderByWithRelationInput[];
    cursor?: Prisma.TranscriptChunkWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TranscriptChunkCountAggregateInputType;
    _avg?: TranscriptChunkAvgAggregateInputType;
    _sum?: TranscriptChunkSumAggregateInputType;
    _min?: TranscriptChunkMinAggregateInputType;
    _max?: TranscriptChunkMaxAggregateInputType;
};
export type GetTranscriptChunkAggregateType<T extends TranscriptChunkAggregateArgs> = {
    [P in keyof T & keyof AggregateTranscriptChunk]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTranscriptChunk[P]> : Prisma.GetScalarType<T[P], AggregateTranscriptChunk[P]>;
};
export type TranscriptChunkGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TranscriptChunkWhereInput;
    orderBy?: Prisma.TranscriptChunkOrderByWithAggregationInput | Prisma.TranscriptChunkOrderByWithAggregationInput[];
    by: Prisma.TranscriptChunkScalarFieldEnum[] | Prisma.TranscriptChunkScalarFieldEnum;
    having?: Prisma.TranscriptChunkScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TranscriptChunkCountAggregateInputType | true;
    _avg?: TranscriptChunkAvgAggregateInputType;
    _sum?: TranscriptChunkSumAggregateInputType;
    _min?: TranscriptChunkMinAggregateInputType;
    _max?: TranscriptChunkMaxAggregateInputType;
};
export type TranscriptChunkGroupByOutputType = {
    id: string;
    sessionId: string;
    sequence: number;
    content: string;
    source: string;
    createdAt: Date;
    _count: TranscriptChunkCountAggregateOutputType | null;
    _avg: TranscriptChunkAvgAggregateOutputType | null;
    _sum: TranscriptChunkSumAggregateOutputType | null;
    _min: TranscriptChunkMinAggregateOutputType | null;
    _max: TranscriptChunkMaxAggregateOutputType | null;
};
type GetTranscriptChunkGroupByPayload<T extends TranscriptChunkGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TranscriptChunkGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TranscriptChunkGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TranscriptChunkGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TranscriptChunkGroupByOutputType[P]>;
}>>;
export type TranscriptChunkWhereInput = {
    AND?: Prisma.TranscriptChunkWhereInput | Prisma.TranscriptChunkWhereInput[];
    OR?: Prisma.TranscriptChunkWhereInput[];
    NOT?: Prisma.TranscriptChunkWhereInput | Prisma.TranscriptChunkWhereInput[];
    id?: Prisma.StringFilter<"TranscriptChunk"> | string;
    sessionId?: Prisma.StringFilter<"TranscriptChunk"> | string;
    sequence?: Prisma.IntFilter<"TranscriptChunk"> | number;
    content?: Prisma.StringFilter<"TranscriptChunk"> | string;
    source?: Prisma.StringFilter<"TranscriptChunk"> | string;
    createdAt?: Prisma.DateTimeFilter<"TranscriptChunk"> | Date | string;
    session?: Prisma.XOR<Prisma.InterviewSessionScalarRelationFilter, Prisma.InterviewSessionWhereInput>;
};
export type TranscriptChunkOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    session?: Prisma.InterviewSessionOrderByWithRelationInput;
};
export type TranscriptChunkWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    sessionId_sequence?: Prisma.TranscriptChunkSessionIdSequenceCompoundUniqueInput;
    AND?: Prisma.TranscriptChunkWhereInput | Prisma.TranscriptChunkWhereInput[];
    OR?: Prisma.TranscriptChunkWhereInput[];
    NOT?: Prisma.TranscriptChunkWhereInput | Prisma.TranscriptChunkWhereInput[];
    sessionId?: Prisma.StringFilter<"TranscriptChunk"> | string;
    sequence?: Prisma.IntFilter<"TranscriptChunk"> | number;
    content?: Prisma.StringFilter<"TranscriptChunk"> | string;
    source?: Prisma.StringFilter<"TranscriptChunk"> | string;
    createdAt?: Prisma.DateTimeFilter<"TranscriptChunk"> | Date | string;
    session?: Prisma.XOR<Prisma.InterviewSessionScalarRelationFilter, Prisma.InterviewSessionWhereInput>;
}, "id" | "sessionId_sequence">;
export type TranscriptChunkOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.TranscriptChunkCountOrderByAggregateInput;
    _avg?: Prisma.TranscriptChunkAvgOrderByAggregateInput;
    _max?: Prisma.TranscriptChunkMaxOrderByAggregateInput;
    _min?: Prisma.TranscriptChunkMinOrderByAggregateInput;
    _sum?: Prisma.TranscriptChunkSumOrderByAggregateInput;
};
export type TranscriptChunkScalarWhereWithAggregatesInput = {
    AND?: Prisma.TranscriptChunkScalarWhereWithAggregatesInput | Prisma.TranscriptChunkScalarWhereWithAggregatesInput[];
    OR?: Prisma.TranscriptChunkScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TranscriptChunkScalarWhereWithAggregatesInput | Prisma.TranscriptChunkScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"TranscriptChunk"> | string;
    sessionId?: Prisma.StringWithAggregatesFilter<"TranscriptChunk"> | string;
    sequence?: Prisma.IntWithAggregatesFilter<"TranscriptChunk"> | number;
    content?: Prisma.StringWithAggregatesFilter<"TranscriptChunk"> | string;
    source?: Prisma.StringWithAggregatesFilter<"TranscriptChunk"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TranscriptChunk"> | Date | string;
};
export type TranscriptChunkCreateInput = {
    id?: string;
    sequence: number;
    content: string;
    source?: string;
    createdAt?: Date | string;
    session: Prisma.InterviewSessionCreateNestedOneWithoutTranscriptsInput;
};
export type TranscriptChunkUncheckedCreateInput = {
    id?: string;
    sessionId: string;
    sequence: number;
    content: string;
    source?: string;
    createdAt?: Date | string;
};
export type TranscriptChunkUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.InterviewSessionUpdateOneRequiredWithoutTranscriptsNestedInput;
};
export type TranscriptChunkUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TranscriptChunkCreateManyInput = {
    id?: string;
    sessionId: string;
    sequence: number;
    content: string;
    source?: string;
    createdAt?: Date | string;
};
export type TranscriptChunkUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TranscriptChunkUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TranscriptChunkListRelationFilter = {
    every?: Prisma.TranscriptChunkWhereInput;
    some?: Prisma.TranscriptChunkWhereInput;
    none?: Prisma.TranscriptChunkWhereInput;
};
export type TranscriptChunkOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TranscriptChunkSessionIdSequenceCompoundUniqueInput = {
    sessionId: string;
    sequence: number;
};
export type TranscriptChunkCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TranscriptChunkAvgOrderByAggregateInput = {
    sequence?: Prisma.SortOrder;
};
export type TranscriptChunkMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TranscriptChunkMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    sequence?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TranscriptChunkSumOrderByAggregateInput = {
    sequence?: Prisma.SortOrder;
};
export type TranscriptChunkCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.TranscriptChunkCreateWithoutSessionInput, Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput> | Prisma.TranscriptChunkCreateWithoutSessionInput[] | Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput | Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.TranscriptChunkCreateManySessionInputEnvelope;
    connect?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
};
export type TranscriptChunkUncheckedCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.TranscriptChunkCreateWithoutSessionInput, Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput> | Prisma.TranscriptChunkCreateWithoutSessionInput[] | Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput | Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.TranscriptChunkCreateManySessionInputEnvelope;
    connect?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
};
export type TranscriptChunkUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.TranscriptChunkCreateWithoutSessionInput, Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput> | Prisma.TranscriptChunkCreateWithoutSessionInput[] | Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput | Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.TranscriptChunkUpsertWithWhereUniqueWithoutSessionInput | Prisma.TranscriptChunkUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.TranscriptChunkCreateManySessionInputEnvelope;
    set?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    disconnect?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    delete?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    connect?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    update?: Prisma.TranscriptChunkUpdateWithWhereUniqueWithoutSessionInput | Prisma.TranscriptChunkUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.TranscriptChunkUpdateManyWithWhereWithoutSessionInput | Prisma.TranscriptChunkUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.TranscriptChunkScalarWhereInput | Prisma.TranscriptChunkScalarWhereInput[];
};
export type TranscriptChunkUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.TranscriptChunkCreateWithoutSessionInput, Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput> | Prisma.TranscriptChunkCreateWithoutSessionInput[] | Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput | Prisma.TranscriptChunkCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.TranscriptChunkUpsertWithWhereUniqueWithoutSessionInput | Prisma.TranscriptChunkUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.TranscriptChunkCreateManySessionInputEnvelope;
    set?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    disconnect?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    delete?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    connect?: Prisma.TranscriptChunkWhereUniqueInput | Prisma.TranscriptChunkWhereUniqueInput[];
    update?: Prisma.TranscriptChunkUpdateWithWhereUniqueWithoutSessionInput | Prisma.TranscriptChunkUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.TranscriptChunkUpdateManyWithWhereWithoutSessionInput | Prisma.TranscriptChunkUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.TranscriptChunkScalarWhereInput | Prisma.TranscriptChunkScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type TranscriptChunkCreateWithoutSessionInput = {
    id?: string;
    sequence: number;
    content: string;
    source?: string;
    createdAt?: Date | string;
};
export type TranscriptChunkUncheckedCreateWithoutSessionInput = {
    id?: string;
    sequence: number;
    content: string;
    source?: string;
    createdAt?: Date | string;
};
export type TranscriptChunkCreateOrConnectWithoutSessionInput = {
    where: Prisma.TranscriptChunkWhereUniqueInput;
    create: Prisma.XOR<Prisma.TranscriptChunkCreateWithoutSessionInput, Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput>;
};
export type TranscriptChunkCreateManySessionInputEnvelope = {
    data: Prisma.TranscriptChunkCreateManySessionInput | Prisma.TranscriptChunkCreateManySessionInput[];
    skipDuplicates?: boolean;
};
export type TranscriptChunkUpsertWithWhereUniqueWithoutSessionInput = {
    where: Prisma.TranscriptChunkWhereUniqueInput;
    update: Prisma.XOR<Prisma.TranscriptChunkUpdateWithoutSessionInput, Prisma.TranscriptChunkUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.TranscriptChunkCreateWithoutSessionInput, Prisma.TranscriptChunkUncheckedCreateWithoutSessionInput>;
};
export type TranscriptChunkUpdateWithWhereUniqueWithoutSessionInput = {
    where: Prisma.TranscriptChunkWhereUniqueInput;
    data: Prisma.XOR<Prisma.TranscriptChunkUpdateWithoutSessionInput, Prisma.TranscriptChunkUncheckedUpdateWithoutSessionInput>;
};
export type TranscriptChunkUpdateManyWithWhereWithoutSessionInput = {
    where: Prisma.TranscriptChunkScalarWhereInput;
    data: Prisma.XOR<Prisma.TranscriptChunkUpdateManyMutationInput, Prisma.TranscriptChunkUncheckedUpdateManyWithoutSessionInput>;
};
export type TranscriptChunkScalarWhereInput = {
    AND?: Prisma.TranscriptChunkScalarWhereInput | Prisma.TranscriptChunkScalarWhereInput[];
    OR?: Prisma.TranscriptChunkScalarWhereInput[];
    NOT?: Prisma.TranscriptChunkScalarWhereInput | Prisma.TranscriptChunkScalarWhereInput[];
    id?: Prisma.StringFilter<"TranscriptChunk"> | string;
    sessionId?: Prisma.StringFilter<"TranscriptChunk"> | string;
    sequence?: Prisma.IntFilter<"TranscriptChunk"> | number;
    content?: Prisma.StringFilter<"TranscriptChunk"> | string;
    source?: Prisma.StringFilter<"TranscriptChunk"> | string;
    createdAt?: Prisma.DateTimeFilter<"TranscriptChunk"> | Date | string;
};
export type TranscriptChunkCreateManySessionInput = {
    id?: string;
    sequence: number;
    content: string;
    source?: string;
    createdAt?: Date | string;
};
export type TranscriptChunkUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TranscriptChunkUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TranscriptChunkUncheckedUpdateManyWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sequence?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TranscriptChunkSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    sequence?: boolean;
    content?: boolean;
    source?: boolean;
    createdAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["transcriptChunk"]>;
export type TranscriptChunkSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    sequence?: boolean;
    content?: boolean;
    source?: boolean;
    createdAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["transcriptChunk"]>;
export type TranscriptChunkSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    sequence?: boolean;
    content?: boolean;
    source?: boolean;
    createdAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["transcriptChunk"]>;
export type TranscriptChunkSelectScalar = {
    id?: boolean;
    sessionId?: boolean;
    sequence?: boolean;
    content?: boolean;
    source?: boolean;
    createdAt?: boolean;
};
export type TranscriptChunkOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessionId" | "sequence" | "content" | "source" | "createdAt", ExtArgs["result"]["transcriptChunk"]>;
export type TranscriptChunkInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type TranscriptChunkIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type TranscriptChunkIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type $TranscriptChunkPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TranscriptChunk";
    objects: {
        session: Prisma.$InterviewSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        sessionId: string;
        sequence: number;
        content: string;
        source: string;
        createdAt: Date;
    }, ExtArgs["result"]["transcriptChunk"]>;
    composites: {};
};
export type TranscriptChunkGetPayload<S extends boolean | null | undefined | TranscriptChunkDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload, S>;
export type TranscriptChunkCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TranscriptChunkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TranscriptChunkCountAggregateInputType | true;
};
export interface TranscriptChunkDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TranscriptChunk'];
        meta: {
            name: 'TranscriptChunk';
        };
    };
    findUnique<T extends TranscriptChunkFindUniqueArgs>(args: Prisma.SelectSubset<T, TranscriptChunkFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TranscriptChunkFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TranscriptChunkFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TranscriptChunkFindFirstArgs>(args?: Prisma.SelectSubset<T, TranscriptChunkFindFirstArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TranscriptChunkFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TranscriptChunkFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TranscriptChunkFindManyArgs>(args?: Prisma.SelectSubset<T, TranscriptChunkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TranscriptChunkCreateArgs>(args: Prisma.SelectSubset<T, TranscriptChunkCreateArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TranscriptChunkCreateManyArgs>(args?: Prisma.SelectSubset<T, TranscriptChunkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TranscriptChunkCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TranscriptChunkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TranscriptChunkDeleteArgs>(args: Prisma.SelectSubset<T, TranscriptChunkDeleteArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TranscriptChunkUpdateArgs>(args: Prisma.SelectSubset<T, TranscriptChunkUpdateArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TranscriptChunkDeleteManyArgs>(args?: Prisma.SelectSubset<T, TranscriptChunkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TranscriptChunkUpdateManyArgs>(args: Prisma.SelectSubset<T, TranscriptChunkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TranscriptChunkUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TranscriptChunkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TranscriptChunkUpsertArgs>(args: Prisma.SelectSubset<T, TranscriptChunkUpsertArgs<ExtArgs>>): Prisma.Prisma__TranscriptChunkClient<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TranscriptChunkCountArgs>(args?: Prisma.Subset<T, TranscriptChunkCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TranscriptChunkCountAggregateOutputType> : number>;
    aggregate<T extends TranscriptChunkAggregateArgs>(args: Prisma.Subset<T, TranscriptChunkAggregateArgs>): Prisma.PrismaPromise<GetTranscriptChunkAggregateType<T>>;
    groupBy<T extends TranscriptChunkGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TranscriptChunkGroupByArgs['orderBy'];
    } : {
        orderBy?: TranscriptChunkGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TranscriptChunkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTranscriptChunkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TranscriptChunkFieldRefs;
}
export interface Prisma__TranscriptChunkClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    session<T extends Prisma.InterviewSessionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewSessionDefaultArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TranscriptChunkFieldRefs {
    readonly id: Prisma.FieldRef<"TranscriptChunk", 'String'>;
    readonly sessionId: Prisma.FieldRef<"TranscriptChunk", 'String'>;
    readonly sequence: Prisma.FieldRef<"TranscriptChunk", 'Int'>;
    readonly content: Prisma.FieldRef<"TranscriptChunk", 'String'>;
    readonly source: Prisma.FieldRef<"TranscriptChunk", 'String'>;
    readonly createdAt: Prisma.FieldRef<"TranscriptChunk", 'DateTime'>;
}
export type TranscriptChunkFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where: Prisma.TranscriptChunkWhereUniqueInput;
};
export type TranscriptChunkFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where: Prisma.TranscriptChunkWhereUniqueInput;
};
export type TranscriptChunkFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where?: Prisma.TranscriptChunkWhereInput;
    orderBy?: Prisma.TranscriptChunkOrderByWithRelationInput | Prisma.TranscriptChunkOrderByWithRelationInput[];
    cursor?: Prisma.TranscriptChunkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TranscriptChunkScalarFieldEnum | Prisma.TranscriptChunkScalarFieldEnum[];
};
export type TranscriptChunkFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where?: Prisma.TranscriptChunkWhereInput;
    orderBy?: Prisma.TranscriptChunkOrderByWithRelationInput | Prisma.TranscriptChunkOrderByWithRelationInput[];
    cursor?: Prisma.TranscriptChunkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TranscriptChunkScalarFieldEnum | Prisma.TranscriptChunkScalarFieldEnum[];
};
export type TranscriptChunkFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where?: Prisma.TranscriptChunkWhereInput;
    orderBy?: Prisma.TranscriptChunkOrderByWithRelationInput | Prisma.TranscriptChunkOrderByWithRelationInput[];
    cursor?: Prisma.TranscriptChunkWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TranscriptChunkScalarFieldEnum | Prisma.TranscriptChunkScalarFieldEnum[];
};
export type TranscriptChunkCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TranscriptChunkCreateInput, Prisma.TranscriptChunkUncheckedCreateInput>;
};
export type TranscriptChunkCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TranscriptChunkCreateManyInput | Prisma.TranscriptChunkCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TranscriptChunkCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    data: Prisma.TranscriptChunkCreateManyInput | Prisma.TranscriptChunkCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TranscriptChunkIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TranscriptChunkUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TranscriptChunkUpdateInput, Prisma.TranscriptChunkUncheckedUpdateInput>;
    where: Prisma.TranscriptChunkWhereUniqueInput;
};
export type TranscriptChunkUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TranscriptChunkUpdateManyMutationInput, Prisma.TranscriptChunkUncheckedUpdateManyInput>;
    where?: Prisma.TranscriptChunkWhereInput;
    limit?: number;
};
export type TranscriptChunkUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TranscriptChunkUpdateManyMutationInput, Prisma.TranscriptChunkUncheckedUpdateManyInput>;
    where?: Prisma.TranscriptChunkWhereInput;
    limit?: number;
    include?: Prisma.TranscriptChunkIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TranscriptChunkUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where: Prisma.TranscriptChunkWhereUniqueInput;
    create: Prisma.XOR<Prisma.TranscriptChunkCreateInput, Prisma.TranscriptChunkUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TranscriptChunkUpdateInput, Prisma.TranscriptChunkUncheckedUpdateInput>;
};
export type TranscriptChunkDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
    where: Prisma.TranscriptChunkWhereUniqueInput;
};
export type TranscriptChunkDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TranscriptChunkWhereInput;
    limit?: number;
};
export type TranscriptChunkDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TranscriptChunkSelect<ExtArgs> | null;
    omit?: Prisma.TranscriptChunkOmit<ExtArgs> | null;
    include?: Prisma.TranscriptChunkInclude<ExtArgs> | null;
};
export {};
