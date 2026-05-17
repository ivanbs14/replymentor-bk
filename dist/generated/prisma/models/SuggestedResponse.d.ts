import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SuggestedResponseModel = runtime.Types.Result.DefaultSelection<Prisma.$SuggestedResponsePayload>;
export type AggregateSuggestedResponse = {
    _count: SuggestedResponseCountAggregateOutputType | null;
    _min: SuggestedResponseMinAggregateOutputType | null;
    _max: SuggestedResponseMaxAggregateOutputType | null;
};
export type SuggestedResponseMinAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    detectedQuestion: string | null;
    suggestedAnswer: string | null;
    shortVersion: string | null;
    strategicNote: string | null;
    createdAt: Date | null;
};
export type SuggestedResponseMaxAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    detectedQuestion: string | null;
    suggestedAnswer: string | null;
    shortVersion: string | null;
    strategicNote: string | null;
    createdAt: Date | null;
};
export type SuggestedResponseCountAggregateOutputType = {
    id: number;
    sessionId: number;
    detectedQuestion: number;
    suggestedAnswer: number;
    shortVersion: number;
    keyPoints: number;
    strategicNote: number;
    createdAt: number;
    _all: number;
};
export type SuggestedResponseMinAggregateInputType = {
    id?: true;
    sessionId?: true;
    detectedQuestion?: true;
    suggestedAnswer?: true;
    shortVersion?: true;
    strategicNote?: true;
    createdAt?: true;
};
export type SuggestedResponseMaxAggregateInputType = {
    id?: true;
    sessionId?: true;
    detectedQuestion?: true;
    suggestedAnswer?: true;
    shortVersion?: true;
    strategicNote?: true;
    createdAt?: true;
};
export type SuggestedResponseCountAggregateInputType = {
    id?: true;
    sessionId?: true;
    detectedQuestion?: true;
    suggestedAnswer?: true;
    shortVersion?: true;
    keyPoints?: true;
    strategicNote?: true;
    createdAt?: true;
    _all?: true;
};
export type SuggestedResponseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SuggestedResponseWhereInput;
    orderBy?: Prisma.SuggestedResponseOrderByWithRelationInput | Prisma.SuggestedResponseOrderByWithRelationInput[];
    cursor?: Prisma.SuggestedResponseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SuggestedResponseCountAggregateInputType;
    _min?: SuggestedResponseMinAggregateInputType;
    _max?: SuggestedResponseMaxAggregateInputType;
};
export type GetSuggestedResponseAggregateType<T extends SuggestedResponseAggregateArgs> = {
    [P in keyof T & keyof AggregateSuggestedResponse]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSuggestedResponse[P]> : Prisma.GetScalarType<T[P], AggregateSuggestedResponse[P]>;
};
export type SuggestedResponseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SuggestedResponseWhereInput;
    orderBy?: Prisma.SuggestedResponseOrderByWithAggregationInput | Prisma.SuggestedResponseOrderByWithAggregationInput[];
    by: Prisma.SuggestedResponseScalarFieldEnum[] | Prisma.SuggestedResponseScalarFieldEnum;
    having?: Prisma.SuggestedResponseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SuggestedResponseCountAggregateInputType | true;
    _min?: SuggestedResponseMinAggregateInputType;
    _max?: SuggestedResponseMaxAggregateInputType;
};
export type SuggestedResponseGroupByOutputType = {
    id: string;
    sessionId: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints: string[];
    strategicNote: string;
    createdAt: Date;
    _count: SuggestedResponseCountAggregateOutputType | null;
    _min: SuggestedResponseMinAggregateOutputType | null;
    _max: SuggestedResponseMaxAggregateOutputType | null;
};
type GetSuggestedResponseGroupByPayload<T extends SuggestedResponseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SuggestedResponseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SuggestedResponseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SuggestedResponseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SuggestedResponseGroupByOutputType[P]>;
}>>;
export type SuggestedResponseWhereInput = {
    AND?: Prisma.SuggestedResponseWhereInput | Prisma.SuggestedResponseWhereInput[];
    OR?: Prisma.SuggestedResponseWhereInput[];
    NOT?: Prisma.SuggestedResponseWhereInput | Prisma.SuggestedResponseWhereInput[];
    id?: Prisma.StringFilter<"SuggestedResponse"> | string;
    sessionId?: Prisma.StringFilter<"SuggestedResponse"> | string;
    detectedQuestion?: Prisma.StringFilter<"SuggestedResponse"> | string;
    suggestedAnswer?: Prisma.StringFilter<"SuggestedResponse"> | string;
    shortVersion?: Prisma.StringFilter<"SuggestedResponse"> | string;
    keyPoints?: Prisma.StringNullableListFilter<"SuggestedResponse">;
    strategicNote?: Prisma.StringFilter<"SuggestedResponse"> | string;
    createdAt?: Prisma.DateTimeFilter<"SuggestedResponse"> | Date | string;
    session?: Prisma.XOR<Prisma.InterviewSessionScalarRelationFilter, Prisma.InterviewSessionWhereInput>;
};
export type SuggestedResponseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    detectedQuestion?: Prisma.SortOrder;
    suggestedAnswer?: Prisma.SortOrder;
    shortVersion?: Prisma.SortOrder;
    keyPoints?: Prisma.SortOrder;
    strategicNote?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    session?: Prisma.InterviewSessionOrderByWithRelationInput;
};
export type SuggestedResponseWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.SuggestedResponseWhereInput | Prisma.SuggestedResponseWhereInput[];
    OR?: Prisma.SuggestedResponseWhereInput[];
    NOT?: Prisma.SuggestedResponseWhereInput | Prisma.SuggestedResponseWhereInput[];
    sessionId?: Prisma.StringFilter<"SuggestedResponse"> | string;
    detectedQuestion?: Prisma.StringFilter<"SuggestedResponse"> | string;
    suggestedAnswer?: Prisma.StringFilter<"SuggestedResponse"> | string;
    shortVersion?: Prisma.StringFilter<"SuggestedResponse"> | string;
    keyPoints?: Prisma.StringNullableListFilter<"SuggestedResponse">;
    strategicNote?: Prisma.StringFilter<"SuggestedResponse"> | string;
    createdAt?: Prisma.DateTimeFilter<"SuggestedResponse"> | Date | string;
    session?: Prisma.XOR<Prisma.InterviewSessionScalarRelationFilter, Prisma.InterviewSessionWhereInput>;
}, "id">;
export type SuggestedResponseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    detectedQuestion?: Prisma.SortOrder;
    suggestedAnswer?: Prisma.SortOrder;
    shortVersion?: Prisma.SortOrder;
    keyPoints?: Prisma.SortOrder;
    strategicNote?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.SuggestedResponseCountOrderByAggregateInput;
    _max?: Prisma.SuggestedResponseMaxOrderByAggregateInput;
    _min?: Prisma.SuggestedResponseMinOrderByAggregateInput;
};
export type SuggestedResponseScalarWhereWithAggregatesInput = {
    AND?: Prisma.SuggestedResponseScalarWhereWithAggregatesInput | Prisma.SuggestedResponseScalarWhereWithAggregatesInput[];
    OR?: Prisma.SuggestedResponseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SuggestedResponseScalarWhereWithAggregatesInput | Prisma.SuggestedResponseScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"SuggestedResponse"> | string;
    sessionId?: Prisma.StringWithAggregatesFilter<"SuggestedResponse"> | string;
    detectedQuestion?: Prisma.StringWithAggregatesFilter<"SuggestedResponse"> | string;
    suggestedAnswer?: Prisma.StringWithAggregatesFilter<"SuggestedResponse"> | string;
    shortVersion?: Prisma.StringWithAggregatesFilter<"SuggestedResponse"> | string;
    keyPoints?: Prisma.StringNullableListFilter<"SuggestedResponse">;
    strategicNote?: Prisma.StringWithAggregatesFilter<"SuggestedResponse"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"SuggestedResponse"> | Date | string;
};
export type SuggestedResponseCreateInput = {
    id?: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints?: Prisma.SuggestedResponseCreatekeyPointsInput | string[];
    strategicNote: string;
    createdAt?: Date | string;
    session: Prisma.InterviewSessionCreateNestedOneWithoutSuggestedResponseInput;
};
export type SuggestedResponseUncheckedCreateInput = {
    id?: string;
    sessionId: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints?: Prisma.SuggestedResponseCreatekeyPointsInput | string[];
    strategicNote: string;
    createdAt?: Date | string;
};
export type SuggestedResponseUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.InterviewSessionUpdateOneRequiredWithoutSuggestedResponseNestedInput;
};
export type SuggestedResponseUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SuggestedResponseCreateManyInput = {
    id?: string;
    sessionId: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints?: Prisma.SuggestedResponseCreatekeyPointsInput | string[];
    strategicNote: string;
    createdAt?: Date | string;
};
export type SuggestedResponseUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SuggestedResponseUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SuggestedResponseListRelationFilter = {
    every?: Prisma.SuggestedResponseWhereInput;
    some?: Prisma.SuggestedResponseWhereInput;
    none?: Prisma.SuggestedResponseWhereInput;
};
export type SuggestedResponseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type SuggestedResponseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    detectedQuestion?: Prisma.SortOrder;
    suggestedAnswer?: Prisma.SortOrder;
    shortVersion?: Prisma.SortOrder;
    keyPoints?: Prisma.SortOrder;
    strategicNote?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type SuggestedResponseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    detectedQuestion?: Prisma.SortOrder;
    suggestedAnswer?: Prisma.SortOrder;
    shortVersion?: Prisma.SortOrder;
    strategicNote?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type SuggestedResponseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    detectedQuestion?: Prisma.SortOrder;
    suggestedAnswer?: Prisma.SortOrder;
    shortVersion?: Prisma.SortOrder;
    strategicNote?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type SuggestedResponseCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.SuggestedResponseCreateWithoutSessionInput, Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput> | Prisma.SuggestedResponseCreateWithoutSessionInput[] | Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput | Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.SuggestedResponseCreateManySessionInputEnvelope;
    connect?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
};
export type SuggestedResponseUncheckedCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.SuggestedResponseCreateWithoutSessionInput, Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput> | Prisma.SuggestedResponseCreateWithoutSessionInput[] | Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput | Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.SuggestedResponseCreateManySessionInputEnvelope;
    connect?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
};
export type SuggestedResponseUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.SuggestedResponseCreateWithoutSessionInput, Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput> | Prisma.SuggestedResponseCreateWithoutSessionInput[] | Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput | Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.SuggestedResponseUpsertWithWhereUniqueWithoutSessionInput | Prisma.SuggestedResponseUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.SuggestedResponseCreateManySessionInputEnvelope;
    set?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    disconnect?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    delete?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    connect?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    update?: Prisma.SuggestedResponseUpdateWithWhereUniqueWithoutSessionInput | Prisma.SuggestedResponseUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.SuggestedResponseUpdateManyWithWhereWithoutSessionInput | Prisma.SuggestedResponseUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.SuggestedResponseScalarWhereInput | Prisma.SuggestedResponseScalarWhereInput[];
};
export type SuggestedResponseUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.SuggestedResponseCreateWithoutSessionInput, Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput> | Prisma.SuggestedResponseCreateWithoutSessionInput[] | Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput | Prisma.SuggestedResponseCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.SuggestedResponseUpsertWithWhereUniqueWithoutSessionInput | Prisma.SuggestedResponseUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.SuggestedResponseCreateManySessionInputEnvelope;
    set?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    disconnect?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    delete?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    connect?: Prisma.SuggestedResponseWhereUniqueInput | Prisma.SuggestedResponseWhereUniqueInput[];
    update?: Prisma.SuggestedResponseUpdateWithWhereUniqueWithoutSessionInput | Prisma.SuggestedResponseUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.SuggestedResponseUpdateManyWithWhereWithoutSessionInput | Prisma.SuggestedResponseUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.SuggestedResponseScalarWhereInput | Prisma.SuggestedResponseScalarWhereInput[];
};
export type SuggestedResponseCreatekeyPointsInput = {
    set: string[];
};
export type SuggestedResponseUpdatekeyPointsInput = {
    set?: string[];
    push?: string | string[];
};
export type SuggestedResponseCreateWithoutSessionInput = {
    id?: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints?: Prisma.SuggestedResponseCreatekeyPointsInput | string[];
    strategicNote: string;
    createdAt?: Date | string;
};
export type SuggestedResponseUncheckedCreateWithoutSessionInput = {
    id?: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints?: Prisma.SuggestedResponseCreatekeyPointsInput | string[];
    strategicNote: string;
    createdAt?: Date | string;
};
export type SuggestedResponseCreateOrConnectWithoutSessionInput = {
    where: Prisma.SuggestedResponseWhereUniqueInput;
    create: Prisma.XOR<Prisma.SuggestedResponseCreateWithoutSessionInput, Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput>;
};
export type SuggestedResponseCreateManySessionInputEnvelope = {
    data: Prisma.SuggestedResponseCreateManySessionInput | Prisma.SuggestedResponseCreateManySessionInput[];
    skipDuplicates?: boolean;
};
export type SuggestedResponseUpsertWithWhereUniqueWithoutSessionInput = {
    where: Prisma.SuggestedResponseWhereUniqueInput;
    update: Prisma.XOR<Prisma.SuggestedResponseUpdateWithoutSessionInput, Prisma.SuggestedResponseUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.SuggestedResponseCreateWithoutSessionInput, Prisma.SuggestedResponseUncheckedCreateWithoutSessionInput>;
};
export type SuggestedResponseUpdateWithWhereUniqueWithoutSessionInput = {
    where: Prisma.SuggestedResponseWhereUniqueInput;
    data: Prisma.XOR<Prisma.SuggestedResponseUpdateWithoutSessionInput, Prisma.SuggestedResponseUncheckedUpdateWithoutSessionInput>;
};
export type SuggestedResponseUpdateManyWithWhereWithoutSessionInput = {
    where: Prisma.SuggestedResponseScalarWhereInput;
    data: Prisma.XOR<Prisma.SuggestedResponseUpdateManyMutationInput, Prisma.SuggestedResponseUncheckedUpdateManyWithoutSessionInput>;
};
export type SuggestedResponseScalarWhereInput = {
    AND?: Prisma.SuggestedResponseScalarWhereInput | Prisma.SuggestedResponseScalarWhereInput[];
    OR?: Prisma.SuggestedResponseScalarWhereInput[];
    NOT?: Prisma.SuggestedResponseScalarWhereInput | Prisma.SuggestedResponseScalarWhereInput[];
    id?: Prisma.StringFilter<"SuggestedResponse"> | string;
    sessionId?: Prisma.StringFilter<"SuggestedResponse"> | string;
    detectedQuestion?: Prisma.StringFilter<"SuggestedResponse"> | string;
    suggestedAnswer?: Prisma.StringFilter<"SuggestedResponse"> | string;
    shortVersion?: Prisma.StringFilter<"SuggestedResponse"> | string;
    keyPoints?: Prisma.StringNullableListFilter<"SuggestedResponse">;
    strategicNote?: Prisma.StringFilter<"SuggestedResponse"> | string;
    createdAt?: Prisma.DateTimeFilter<"SuggestedResponse"> | Date | string;
};
export type SuggestedResponseCreateManySessionInput = {
    id?: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints?: Prisma.SuggestedResponseCreatekeyPointsInput | string[];
    strategicNote: string;
    createdAt?: Date | string;
};
export type SuggestedResponseUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SuggestedResponseUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SuggestedResponseUncheckedUpdateManyWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    detectedQuestion?: Prisma.StringFieldUpdateOperationsInput | string;
    suggestedAnswer?: Prisma.StringFieldUpdateOperationsInput | string;
    shortVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    keyPoints?: Prisma.SuggestedResponseUpdatekeyPointsInput | string[];
    strategicNote?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SuggestedResponseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    detectedQuestion?: boolean;
    suggestedAnswer?: boolean;
    shortVersion?: boolean;
    keyPoints?: boolean;
    strategicNote?: boolean;
    createdAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["suggestedResponse"]>;
export type SuggestedResponseSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    detectedQuestion?: boolean;
    suggestedAnswer?: boolean;
    shortVersion?: boolean;
    keyPoints?: boolean;
    strategicNote?: boolean;
    createdAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["suggestedResponse"]>;
export type SuggestedResponseSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    detectedQuestion?: boolean;
    suggestedAnswer?: boolean;
    shortVersion?: boolean;
    keyPoints?: boolean;
    strategicNote?: boolean;
    createdAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["suggestedResponse"]>;
export type SuggestedResponseSelectScalar = {
    id?: boolean;
    sessionId?: boolean;
    detectedQuestion?: boolean;
    suggestedAnswer?: boolean;
    shortVersion?: boolean;
    keyPoints?: boolean;
    strategicNote?: boolean;
    createdAt?: boolean;
};
export type SuggestedResponseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessionId" | "detectedQuestion" | "suggestedAnswer" | "shortVersion" | "keyPoints" | "strategicNote" | "createdAt", ExtArgs["result"]["suggestedResponse"]>;
export type SuggestedResponseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type SuggestedResponseIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type SuggestedResponseIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type $SuggestedResponsePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SuggestedResponse";
    objects: {
        session: Prisma.$InterviewSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        sessionId: string;
        detectedQuestion: string;
        suggestedAnswer: string;
        shortVersion: string;
        keyPoints: string[];
        strategicNote: string;
        createdAt: Date;
    }, ExtArgs["result"]["suggestedResponse"]>;
    composites: {};
};
export type SuggestedResponseGetPayload<S extends boolean | null | undefined | SuggestedResponseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload, S>;
export type SuggestedResponseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SuggestedResponseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SuggestedResponseCountAggregateInputType | true;
};
export interface SuggestedResponseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SuggestedResponse'];
        meta: {
            name: 'SuggestedResponse';
        };
    };
    findUnique<T extends SuggestedResponseFindUniqueArgs>(args: Prisma.SelectSubset<T, SuggestedResponseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SuggestedResponseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SuggestedResponseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SuggestedResponseFindFirstArgs>(args?: Prisma.SelectSubset<T, SuggestedResponseFindFirstArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SuggestedResponseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SuggestedResponseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SuggestedResponseFindManyArgs>(args?: Prisma.SelectSubset<T, SuggestedResponseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SuggestedResponseCreateArgs>(args: Prisma.SelectSubset<T, SuggestedResponseCreateArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SuggestedResponseCreateManyArgs>(args?: Prisma.SelectSubset<T, SuggestedResponseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SuggestedResponseCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SuggestedResponseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SuggestedResponseDeleteArgs>(args: Prisma.SelectSubset<T, SuggestedResponseDeleteArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SuggestedResponseUpdateArgs>(args: Prisma.SelectSubset<T, SuggestedResponseUpdateArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SuggestedResponseDeleteManyArgs>(args?: Prisma.SelectSubset<T, SuggestedResponseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SuggestedResponseUpdateManyArgs>(args: Prisma.SelectSubset<T, SuggestedResponseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SuggestedResponseUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SuggestedResponseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SuggestedResponseUpsertArgs>(args: Prisma.SelectSubset<T, SuggestedResponseUpsertArgs<ExtArgs>>): Prisma.Prisma__SuggestedResponseClient<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SuggestedResponseCountArgs>(args?: Prisma.Subset<T, SuggestedResponseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SuggestedResponseCountAggregateOutputType> : number>;
    aggregate<T extends SuggestedResponseAggregateArgs>(args: Prisma.Subset<T, SuggestedResponseAggregateArgs>): Prisma.PrismaPromise<GetSuggestedResponseAggregateType<T>>;
    groupBy<T extends SuggestedResponseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SuggestedResponseGroupByArgs['orderBy'];
    } : {
        orderBy?: SuggestedResponseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SuggestedResponseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuggestedResponseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SuggestedResponseFieldRefs;
}
export interface Prisma__SuggestedResponseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    session<T extends Prisma.InterviewSessionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewSessionDefaultArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SuggestedResponseFieldRefs {
    readonly id: Prisma.FieldRef<"SuggestedResponse", 'String'>;
    readonly sessionId: Prisma.FieldRef<"SuggestedResponse", 'String'>;
    readonly detectedQuestion: Prisma.FieldRef<"SuggestedResponse", 'String'>;
    readonly suggestedAnswer: Prisma.FieldRef<"SuggestedResponse", 'String'>;
    readonly shortVersion: Prisma.FieldRef<"SuggestedResponse", 'String'>;
    readonly keyPoints: Prisma.FieldRef<"SuggestedResponse", 'String[]'>;
    readonly strategicNote: Prisma.FieldRef<"SuggestedResponse", 'String'>;
    readonly createdAt: Prisma.FieldRef<"SuggestedResponse", 'DateTime'>;
}
export type SuggestedResponseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where: Prisma.SuggestedResponseWhereUniqueInput;
};
export type SuggestedResponseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where: Prisma.SuggestedResponseWhereUniqueInput;
};
export type SuggestedResponseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where?: Prisma.SuggestedResponseWhereInput;
    orderBy?: Prisma.SuggestedResponseOrderByWithRelationInput | Prisma.SuggestedResponseOrderByWithRelationInput[];
    cursor?: Prisma.SuggestedResponseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SuggestedResponseScalarFieldEnum | Prisma.SuggestedResponseScalarFieldEnum[];
};
export type SuggestedResponseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where?: Prisma.SuggestedResponseWhereInput;
    orderBy?: Prisma.SuggestedResponseOrderByWithRelationInput | Prisma.SuggestedResponseOrderByWithRelationInput[];
    cursor?: Prisma.SuggestedResponseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SuggestedResponseScalarFieldEnum | Prisma.SuggestedResponseScalarFieldEnum[];
};
export type SuggestedResponseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where?: Prisma.SuggestedResponseWhereInput;
    orderBy?: Prisma.SuggestedResponseOrderByWithRelationInput | Prisma.SuggestedResponseOrderByWithRelationInput[];
    cursor?: Prisma.SuggestedResponseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SuggestedResponseScalarFieldEnum | Prisma.SuggestedResponseScalarFieldEnum[];
};
export type SuggestedResponseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SuggestedResponseCreateInput, Prisma.SuggestedResponseUncheckedCreateInput>;
};
export type SuggestedResponseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SuggestedResponseCreateManyInput | Prisma.SuggestedResponseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SuggestedResponseCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    data: Prisma.SuggestedResponseCreateManyInput | Prisma.SuggestedResponseCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SuggestedResponseIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SuggestedResponseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SuggestedResponseUpdateInput, Prisma.SuggestedResponseUncheckedUpdateInput>;
    where: Prisma.SuggestedResponseWhereUniqueInput;
};
export type SuggestedResponseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SuggestedResponseUpdateManyMutationInput, Prisma.SuggestedResponseUncheckedUpdateManyInput>;
    where?: Prisma.SuggestedResponseWhereInput;
    limit?: number;
};
export type SuggestedResponseUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SuggestedResponseUpdateManyMutationInput, Prisma.SuggestedResponseUncheckedUpdateManyInput>;
    where?: Prisma.SuggestedResponseWhereInput;
    limit?: number;
    include?: Prisma.SuggestedResponseIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SuggestedResponseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where: Prisma.SuggestedResponseWhereUniqueInput;
    create: Prisma.XOR<Prisma.SuggestedResponseCreateInput, Prisma.SuggestedResponseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SuggestedResponseUpdateInput, Prisma.SuggestedResponseUncheckedUpdateInput>;
};
export type SuggestedResponseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
    where: Prisma.SuggestedResponseWhereUniqueInput;
};
export type SuggestedResponseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SuggestedResponseWhereInput;
    limit?: number;
};
export type SuggestedResponseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SuggestedResponseSelect<ExtArgs> | null;
    omit?: Prisma.SuggestedResponseOmit<ExtArgs> | null;
    include?: Prisma.SuggestedResponseInclude<ExtArgs> | null;
};
export {};
