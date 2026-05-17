import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type InterviewSessionModel = runtime.Types.Result.DefaultSelection<Prisma.$InterviewSessionPayload>;
export type AggregateInterviewSession = {
    _count: InterviewSessionCountAggregateOutputType | null;
    _min: InterviewSessionMinAggregateOutputType | null;
    _max: InterviewSessionMaxAggregateOutputType | null;
};
export type InterviewSessionMinAggregateOutputType = {
    id: string | null;
    status: $Enums.SessionStatus | null;
    startedAt: Date | null;
    endedAt: Date | null;
    contextId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type InterviewSessionMaxAggregateOutputType = {
    id: string | null;
    status: $Enums.SessionStatus | null;
    startedAt: Date | null;
    endedAt: Date | null;
    contextId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type InterviewSessionCountAggregateOutputType = {
    id: number;
    status: number;
    startedAt: number;
    endedAt: number;
    contextId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type InterviewSessionMinAggregateInputType = {
    id?: true;
    status?: true;
    startedAt?: true;
    endedAt?: true;
    contextId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type InterviewSessionMaxAggregateInputType = {
    id?: true;
    status?: true;
    startedAt?: true;
    endedAt?: true;
    contextId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type InterviewSessionCountAggregateInputType = {
    id?: true;
    status?: true;
    startedAt?: true;
    endedAt?: true;
    contextId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type InterviewSessionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewSessionWhereInput;
    orderBy?: Prisma.InterviewSessionOrderByWithRelationInput | Prisma.InterviewSessionOrderByWithRelationInput[];
    cursor?: Prisma.InterviewSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | InterviewSessionCountAggregateInputType;
    _min?: InterviewSessionMinAggregateInputType;
    _max?: InterviewSessionMaxAggregateInputType;
};
export type GetInterviewSessionAggregateType<T extends InterviewSessionAggregateArgs> = {
    [P in keyof T & keyof AggregateInterviewSession]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateInterviewSession[P]> : Prisma.GetScalarType<T[P], AggregateInterviewSession[P]>;
};
export type InterviewSessionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewSessionWhereInput;
    orderBy?: Prisma.InterviewSessionOrderByWithAggregationInput | Prisma.InterviewSessionOrderByWithAggregationInput[];
    by: Prisma.InterviewSessionScalarFieldEnum[] | Prisma.InterviewSessionScalarFieldEnum;
    having?: Prisma.InterviewSessionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: InterviewSessionCountAggregateInputType | true;
    _min?: InterviewSessionMinAggregateInputType;
    _max?: InterviewSessionMaxAggregateInputType;
};
export type InterviewSessionGroupByOutputType = {
    id: string;
    status: $Enums.SessionStatus;
    startedAt: Date;
    endedAt: Date | null;
    contextId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: InterviewSessionCountAggregateOutputType | null;
    _min: InterviewSessionMinAggregateOutputType | null;
    _max: InterviewSessionMaxAggregateOutputType | null;
};
type GetInterviewSessionGroupByPayload<T extends InterviewSessionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<InterviewSessionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof InterviewSessionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], InterviewSessionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], InterviewSessionGroupByOutputType[P]>;
}>>;
export type InterviewSessionWhereInput = {
    AND?: Prisma.InterviewSessionWhereInput | Prisma.InterviewSessionWhereInput[];
    OR?: Prisma.InterviewSessionWhereInput[];
    NOT?: Prisma.InterviewSessionWhereInput | Prisma.InterviewSessionWhereInput[];
    id?: Prisma.StringFilter<"InterviewSession"> | string;
    status?: Prisma.EnumSessionStatusFilter<"InterviewSession"> | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    endedAt?: Prisma.DateTimeNullableFilter<"InterviewSession"> | Date | string | null;
    contextId?: Prisma.StringFilter<"InterviewSession"> | string;
    createdAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    context?: Prisma.XOR<Prisma.InterviewContextScalarRelationFilter, Prisma.InterviewContextWhereInput>;
    transcripts?: Prisma.TranscriptChunkListRelationFilter;
    suggestedResponse?: Prisma.SuggestedResponseListRelationFilter;
    summary?: Prisma.XOR<Prisma.SessionSummaryNullableScalarRelationFilter, Prisma.SessionSummaryWhereInput> | null;
};
export type InterviewSessionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    contextId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    context?: Prisma.InterviewContextOrderByWithRelationInput;
    transcripts?: Prisma.TranscriptChunkOrderByRelationAggregateInput;
    suggestedResponse?: Prisma.SuggestedResponseOrderByRelationAggregateInput;
    summary?: Prisma.SessionSummaryOrderByWithRelationInput;
};
export type InterviewSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.InterviewSessionWhereInput | Prisma.InterviewSessionWhereInput[];
    OR?: Prisma.InterviewSessionWhereInput[];
    NOT?: Prisma.InterviewSessionWhereInput | Prisma.InterviewSessionWhereInput[];
    status?: Prisma.EnumSessionStatusFilter<"InterviewSession"> | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    endedAt?: Prisma.DateTimeNullableFilter<"InterviewSession"> | Date | string | null;
    contextId?: Prisma.StringFilter<"InterviewSession"> | string;
    createdAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    context?: Prisma.XOR<Prisma.InterviewContextScalarRelationFilter, Prisma.InterviewContextWhereInput>;
    transcripts?: Prisma.TranscriptChunkListRelationFilter;
    suggestedResponse?: Prisma.SuggestedResponseListRelationFilter;
    summary?: Prisma.XOR<Prisma.SessionSummaryNullableScalarRelationFilter, Prisma.SessionSummaryWhereInput> | null;
}, "id">;
export type InterviewSessionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    contextId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.InterviewSessionCountOrderByAggregateInput;
    _max?: Prisma.InterviewSessionMaxOrderByAggregateInput;
    _min?: Prisma.InterviewSessionMinOrderByAggregateInput;
};
export type InterviewSessionScalarWhereWithAggregatesInput = {
    AND?: Prisma.InterviewSessionScalarWhereWithAggregatesInput | Prisma.InterviewSessionScalarWhereWithAggregatesInput[];
    OR?: Prisma.InterviewSessionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.InterviewSessionScalarWhereWithAggregatesInput | Prisma.InterviewSessionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"InterviewSession"> | string;
    status?: Prisma.EnumSessionStatusWithAggregatesFilter<"InterviewSession"> | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string;
    endedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"InterviewSession"> | Date | string | null;
    contextId?: Prisma.StringWithAggregatesFilter<"InterviewSession"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"InterviewSession"> | Date | string;
};
export type InterviewSessionCreateInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    context: Prisma.InterviewContextCreateNestedOneWithoutSessionsInput;
    transcripts?: Prisma.TranscriptChunkCreateNestedManyWithoutSessionInput;
    suggestedResponse?: Prisma.SuggestedResponseCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionUncheckedCreateInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    contextId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedCreateNestedManyWithoutSessionInput;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryUncheckedCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    context?: Prisma.InterviewContextUpdateOneRequiredWithoutSessionsNestedInput;
    transcripts?: Prisma.TranscriptChunkUpdateManyWithoutSessionNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contextId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedUpdateManyWithoutSessionNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUncheckedUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionCreateManyInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    contextId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type InterviewSessionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewSessionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contextId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewSessionListRelationFilter = {
    every?: Prisma.InterviewSessionWhereInput;
    some?: Prisma.InterviewSessionWhereInput;
    none?: Prisma.InterviewSessionWhereInput;
};
export type InterviewSessionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type InterviewSessionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrder;
    contextId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type InterviewSessionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrder;
    contextId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type InterviewSessionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    endedAt?: Prisma.SortOrder;
    contextId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type InterviewSessionScalarRelationFilter = {
    is?: Prisma.InterviewSessionWhereInput;
    isNot?: Prisma.InterviewSessionWhereInput;
};
export type InterviewSessionCreateNestedManyWithoutContextInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutContextInput, Prisma.InterviewSessionUncheckedCreateWithoutContextInput> | Prisma.InterviewSessionCreateWithoutContextInput[] | Prisma.InterviewSessionUncheckedCreateWithoutContextInput[];
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutContextInput | Prisma.InterviewSessionCreateOrConnectWithoutContextInput[];
    createMany?: Prisma.InterviewSessionCreateManyContextInputEnvelope;
    connect?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
};
export type InterviewSessionUncheckedCreateNestedManyWithoutContextInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutContextInput, Prisma.InterviewSessionUncheckedCreateWithoutContextInput> | Prisma.InterviewSessionCreateWithoutContextInput[] | Prisma.InterviewSessionUncheckedCreateWithoutContextInput[];
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutContextInput | Prisma.InterviewSessionCreateOrConnectWithoutContextInput[];
    createMany?: Prisma.InterviewSessionCreateManyContextInputEnvelope;
    connect?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
};
export type InterviewSessionUpdateManyWithoutContextNestedInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutContextInput, Prisma.InterviewSessionUncheckedCreateWithoutContextInput> | Prisma.InterviewSessionCreateWithoutContextInput[] | Prisma.InterviewSessionUncheckedCreateWithoutContextInput[];
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutContextInput | Prisma.InterviewSessionCreateOrConnectWithoutContextInput[];
    upsert?: Prisma.InterviewSessionUpsertWithWhereUniqueWithoutContextInput | Prisma.InterviewSessionUpsertWithWhereUniqueWithoutContextInput[];
    createMany?: Prisma.InterviewSessionCreateManyContextInputEnvelope;
    set?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    disconnect?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    delete?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    connect?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    update?: Prisma.InterviewSessionUpdateWithWhereUniqueWithoutContextInput | Prisma.InterviewSessionUpdateWithWhereUniqueWithoutContextInput[];
    updateMany?: Prisma.InterviewSessionUpdateManyWithWhereWithoutContextInput | Prisma.InterviewSessionUpdateManyWithWhereWithoutContextInput[];
    deleteMany?: Prisma.InterviewSessionScalarWhereInput | Prisma.InterviewSessionScalarWhereInput[];
};
export type InterviewSessionUncheckedUpdateManyWithoutContextNestedInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutContextInput, Prisma.InterviewSessionUncheckedCreateWithoutContextInput> | Prisma.InterviewSessionCreateWithoutContextInput[] | Prisma.InterviewSessionUncheckedCreateWithoutContextInput[];
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutContextInput | Prisma.InterviewSessionCreateOrConnectWithoutContextInput[];
    upsert?: Prisma.InterviewSessionUpsertWithWhereUniqueWithoutContextInput | Prisma.InterviewSessionUpsertWithWhereUniqueWithoutContextInput[];
    createMany?: Prisma.InterviewSessionCreateManyContextInputEnvelope;
    set?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    disconnect?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    delete?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    connect?: Prisma.InterviewSessionWhereUniqueInput | Prisma.InterviewSessionWhereUniqueInput[];
    update?: Prisma.InterviewSessionUpdateWithWhereUniqueWithoutContextInput | Prisma.InterviewSessionUpdateWithWhereUniqueWithoutContextInput[];
    updateMany?: Prisma.InterviewSessionUpdateManyWithWhereWithoutContextInput | Prisma.InterviewSessionUpdateManyWithWhereWithoutContextInput[];
    deleteMany?: Prisma.InterviewSessionScalarWhereInput | Prisma.InterviewSessionScalarWhereInput[];
};
export type EnumSessionStatusFieldUpdateOperationsInput = {
    set?: $Enums.SessionStatus;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type InterviewSessionCreateNestedOneWithoutTranscriptsInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutTranscriptsInput, Prisma.InterviewSessionUncheckedCreateWithoutTranscriptsInput>;
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutTranscriptsInput;
    connect?: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionUpdateOneRequiredWithoutTranscriptsNestedInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutTranscriptsInput, Prisma.InterviewSessionUncheckedCreateWithoutTranscriptsInput>;
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutTranscriptsInput;
    upsert?: Prisma.InterviewSessionUpsertWithoutTranscriptsInput;
    connect?: Prisma.InterviewSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.InterviewSessionUpdateToOneWithWhereWithoutTranscriptsInput, Prisma.InterviewSessionUpdateWithoutTranscriptsInput>, Prisma.InterviewSessionUncheckedUpdateWithoutTranscriptsInput>;
};
export type InterviewSessionCreateNestedOneWithoutSuggestedResponseInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSuggestedResponseInput, Prisma.InterviewSessionUncheckedCreateWithoutSuggestedResponseInput>;
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutSuggestedResponseInput;
    connect?: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionUpdateOneRequiredWithoutSuggestedResponseNestedInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSuggestedResponseInput, Prisma.InterviewSessionUncheckedCreateWithoutSuggestedResponseInput>;
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutSuggestedResponseInput;
    upsert?: Prisma.InterviewSessionUpsertWithoutSuggestedResponseInput;
    connect?: Prisma.InterviewSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.InterviewSessionUpdateToOneWithWhereWithoutSuggestedResponseInput, Prisma.InterviewSessionUpdateWithoutSuggestedResponseInput>, Prisma.InterviewSessionUncheckedUpdateWithoutSuggestedResponseInput>;
};
export type InterviewSessionCreateNestedOneWithoutSummaryInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSummaryInput, Prisma.InterviewSessionUncheckedCreateWithoutSummaryInput>;
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutSummaryInput;
    connect?: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionUpdateOneRequiredWithoutSummaryNestedInput = {
    create?: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSummaryInput, Prisma.InterviewSessionUncheckedCreateWithoutSummaryInput>;
    connectOrCreate?: Prisma.InterviewSessionCreateOrConnectWithoutSummaryInput;
    upsert?: Prisma.InterviewSessionUpsertWithoutSummaryInput;
    connect?: Prisma.InterviewSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.InterviewSessionUpdateToOneWithWhereWithoutSummaryInput, Prisma.InterviewSessionUpdateWithoutSummaryInput>, Prisma.InterviewSessionUncheckedUpdateWithoutSummaryInput>;
};
export type InterviewSessionCreateWithoutContextInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transcripts?: Prisma.TranscriptChunkCreateNestedManyWithoutSessionInput;
    suggestedResponse?: Prisma.SuggestedResponseCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionUncheckedCreateWithoutContextInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedCreateNestedManyWithoutSessionInput;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryUncheckedCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionCreateOrConnectWithoutContextInput = {
    where: Prisma.InterviewSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutContextInput, Prisma.InterviewSessionUncheckedCreateWithoutContextInput>;
};
export type InterviewSessionCreateManyContextInputEnvelope = {
    data: Prisma.InterviewSessionCreateManyContextInput | Prisma.InterviewSessionCreateManyContextInput[];
    skipDuplicates?: boolean;
};
export type InterviewSessionUpsertWithWhereUniqueWithoutContextInput = {
    where: Prisma.InterviewSessionWhereUniqueInput;
    update: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutContextInput, Prisma.InterviewSessionUncheckedUpdateWithoutContextInput>;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutContextInput, Prisma.InterviewSessionUncheckedCreateWithoutContextInput>;
};
export type InterviewSessionUpdateWithWhereUniqueWithoutContextInput = {
    where: Prisma.InterviewSessionWhereUniqueInput;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutContextInput, Prisma.InterviewSessionUncheckedUpdateWithoutContextInput>;
};
export type InterviewSessionUpdateManyWithWhereWithoutContextInput = {
    where: Prisma.InterviewSessionScalarWhereInput;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateManyMutationInput, Prisma.InterviewSessionUncheckedUpdateManyWithoutContextInput>;
};
export type InterviewSessionScalarWhereInput = {
    AND?: Prisma.InterviewSessionScalarWhereInput | Prisma.InterviewSessionScalarWhereInput[];
    OR?: Prisma.InterviewSessionScalarWhereInput[];
    NOT?: Prisma.InterviewSessionScalarWhereInput | Prisma.InterviewSessionScalarWhereInput[];
    id?: Prisma.StringFilter<"InterviewSession"> | string;
    status?: Prisma.EnumSessionStatusFilter<"InterviewSession"> | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    endedAt?: Prisma.DateTimeNullableFilter<"InterviewSession"> | Date | string | null;
    contextId?: Prisma.StringFilter<"InterviewSession"> | string;
    createdAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"InterviewSession"> | Date | string;
};
export type InterviewSessionCreateWithoutTranscriptsInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    context: Prisma.InterviewContextCreateNestedOneWithoutSessionsInput;
    suggestedResponse?: Prisma.SuggestedResponseCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionUncheckedCreateWithoutTranscriptsInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    contextId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryUncheckedCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionCreateOrConnectWithoutTranscriptsInput = {
    where: Prisma.InterviewSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutTranscriptsInput, Prisma.InterviewSessionUncheckedCreateWithoutTranscriptsInput>;
};
export type InterviewSessionUpsertWithoutTranscriptsInput = {
    update: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutTranscriptsInput, Prisma.InterviewSessionUncheckedUpdateWithoutTranscriptsInput>;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutTranscriptsInput, Prisma.InterviewSessionUncheckedCreateWithoutTranscriptsInput>;
    where?: Prisma.InterviewSessionWhereInput;
};
export type InterviewSessionUpdateToOneWithWhereWithoutTranscriptsInput = {
    where?: Prisma.InterviewSessionWhereInput;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutTranscriptsInput, Prisma.InterviewSessionUncheckedUpdateWithoutTranscriptsInput>;
};
export type InterviewSessionUpdateWithoutTranscriptsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    context?: Prisma.InterviewContextUpdateOneRequiredWithoutSessionsNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionUncheckedUpdateWithoutTranscriptsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contextId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUncheckedUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionCreateWithoutSuggestedResponseInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    context: Prisma.InterviewContextCreateNestedOneWithoutSessionsInput;
    transcripts?: Prisma.TranscriptChunkCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionUncheckedCreateWithoutSuggestedResponseInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    contextId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedCreateNestedManyWithoutSessionInput;
    summary?: Prisma.SessionSummaryUncheckedCreateNestedOneWithoutSessionInput;
};
export type InterviewSessionCreateOrConnectWithoutSuggestedResponseInput = {
    where: Prisma.InterviewSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSuggestedResponseInput, Prisma.InterviewSessionUncheckedCreateWithoutSuggestedResponseInput>;
};
export type InterviewSessionUpsertWithoutSuggestedResponseInput = {
    update: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutSuggestedResponseInput, Prisma.InterviewSessionUncheckedUpdateWithoutSuggestedResponseInput>;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSuggestedResponseInput, Prisma.InterviewSessionUncheckedCreateWithoutSuggestedResponseInput>;
    where?: Prisma.InterviewSessionWhereInput;
};
export type InterviewSessionUpdateToOneWithWhereWithoutSuggestedResponseInput = {
    where?: Prisma.InterviewSessionWhereInput;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutSuggestedResponseInput, Prisma.InterviewSessionUncheckedUpdateWithoutSuggestedResponseInput>;
};
export type InterviewSessionUpdateWithoutSuggestedResponseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    context?: Prisma.InterviewContextUpdateOneRequiredWithoutSessionsNestedInput;
    transcripts?: Prisma.TranscriptChunkUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionUncheckedUpdateWithoutSuggestedResponseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contextId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUncheckedUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionCreateWithoutSummaryInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    context: Prisma.InterviewContextCreateNestedOneWithoutSessionsInput;
    transcripts?: Prisma.TranscriptChunkCreateNestedManyWithoutSessionInput;
    suggestedResponse?: Prisma.SuggestedResponseCreateNestedManyWithoutSessionInput;
};
export type InterviewSessionUncheckedCreateWithoutSummaryInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    contextId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedCreateNestedManyWithoutSessionInput;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedCreateNestedManyWithoutSessionInput;
};
export type InterviewSessionCreateOrConnectWithoutSummaryInput = {
    where: Prisma.InterviewSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSummaryInput, Prisma.InterviewSessionUncheckedCreateWithoutSummaryInput>;
};
export type InterviewSessionUpsertWithoutSummaryInput = {
    update: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutSummaryInput, Prisma.InterviewSessionUncheckedUpdateWithoutSummaryInput>;
    create: Prisma.XOR<Prisma.InterviewSessionCreateWithoutSummaryInput, Prisma.InterviewSessionUncheckedCreateWithoutSummaryInput>;
    where?: Prisma.InterviewSessionWhereInput;
};
export type InterviewSessionUpdateToOneWithWhereWithoutSummaryInput = {
    where?: Prisma.InterviewSessionWhereInput;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateWithoutSummaryInput, Prisma.InterviewSessionUncheckedUpdateWithoutSummaryInput>;
};
export type InterviewSessionUpdateWithoutSummaryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    context?: Prisma.InterviewContextUpdateOneRequiredWithoutSessionsNestedInput;
    transcripts?: Prisma.TranscriptChunkUpdateManyWithoutSessionNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUpdateManyWithoutSessionNestedInput;
};
export type InterviewSessionUncheckedUpdateWithoutSummaryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contextId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedUpdateManyWithoutSessionNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedUpdateManyWithoutSessionNestedInput;
};
export type InterviewSessionCreateManyContextInput = {
    id?: string;
    status?: $Enums.SessionStatus;
    startedAt?: Date | string;
    endedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type InterviewSessionUpdateWithoutContextInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transcripts?: Prisma.TranscriptChunkUpdateManyWithoutSessionNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionUncheckedUpdateWithoutContextInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transcripts?: Prisma.TranscriptChunkUncheckedUpdateManyWithoutSessionNestedInput;
    suggestedResponse?: Prisma.SuggestedResponseUncheckedUpdateManyWithoutSessionNestedInput;
    summary?: Prisma.SessionSummaryUncheckedUpdateOneWithoutSessionNestedInput;
};
export type InterviewSessionUncheckedUpdateManyWithoutContextInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewSessionCountOutputType = {
    transcripts: number;
    suggestedResponse: number;
};
export type InterviewSessionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transcripts?: boolean | InterviewSessionCountOutputTypeCountTranscriptsArgs;
    suggestedResponse?: boolean | InterviewSessionCountOutputTypeCountSuggestedResponseArgs;
};
export type InterviewSessionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionCountOutputTypeSelect<ExtArgs> | null;
};
export type InterviewSessionCountOutputTypeCountTranscriptsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TranscriptChunkWhereInput;
};
export type InterviewSessionCountOutputTypeCountSuggestedResponseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SuggestedResponseWhereInput;
};
export type InterviewSessionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    contextId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    context?: boolean | Prisma.InterviewContextDefaultArgs<ExtArgs>;
    transcripts?: boolean | Prisma.InterviewSession$transcriptsArgs<ExtArgs>;
    suggestedResponse?: boolean | Prisma.InterviewSession$suggestedResponseArgs<ExtArgs>;
    summary?: boolean | Prisma.InterviewSession$summaryArgs<ExtArgs>;
    _count?: boolean | Prisma.InterviewSessionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["interviewSession"]>;
export type InterviewSessionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    contextId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    context?: boolean | Prisma.InterviewContextDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["interviewSession"]>;
export type InterviewSessionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    contextId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    context?: boolean | Prisma.InterviewContextDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["interviewSession"]>;
export type InterviewSessionSelectScalar = {
    id?: boolean;
    status?: boolean;
    startedAt?: boolean;
    endedAt?: boolean;
    contextId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type InterviewSessionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "status" | "startedAt" | "endedAt" | "contextId" | "createdAt" | "updatedAt", ExtArgs["result"]["interviewSession"]>;
export type InterviewSessionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    context?: boolean | Prisma.InterviewContextDefaultArgs<ExtArgs>;
    transcripts?: boolean | Prisma.InterviewSession$transcriptsArgs<ExtArgs>;
    suggestedResponse?: boolean | Prisma.InterviewSession$suggestedResponseArgs<ExtArgs>;
    summary?: boolean | Prisma.InterviewSession$summaryArgs<ExtArgs>;
    _count?: boolean | Prisma.InterviewSessionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type InterviewSessionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    context?: boolean | Prisma.InterviewContextDefaultArgs<ExtArgs>;
};
export type InterviewSessionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    context?: boolean | Prisma.InterviewContextDefaultArgs<ExtArgs>;
};
export type $InterviewSessionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "InterviewSession";
    objects: {
        context: Prisma.$InterviewContextPayload<ExtArgs>;
        transcripts: Prisma.$TranscriptChunkPayload<ExtArgs>[];
        suggestedResponse: Prisma.$SuggestedResponsePayload<ExtArgs>[];
        summary: Prisma.$SessionSummaryPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        status: $Enums.SessionStatus;
        startedAt: Date;
        endedAt: Date | null;
        contextId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["interviewSession"]>;
    composites: {};
};
export type InterviewSessionGetPayload<S extends boolean | null | undefined | InterviewSessionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload, S>;
export type InterviewSessionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<InterviewSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InterviewSessionCountAggregateInputType | true;
};
export interface InterviewSessionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['InterviewSession'];
        meta: {
            name: 'InterviewSession';
        };
    };
    findUnique<T extends InterviewSessionFindUniqueArgs>(args: Prisma.SelectSubset<T, InterviewSessionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends InterviewSessionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InterviewSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends InterviewSessionFindFirstArgs>(args?: Prisma.SelectSubset<T, InterviewSessionFindFirstArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends InterviewSessionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InterviewSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends InterviewSessionFindManyArgs>(args?: Prisma.SelectSubset<T, InterviewSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends InterviewSessionCreateArgs>(args: Prisma.SelectSubset<T, InterviewSessionCreateArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends InterviewSessionCreateManyArgs>(args?: Prisma.SelectSubset<T, InterviewSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends InterviewSessionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InterviewSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends InterviewSessionDeleteArgs>(args: Prisma.SelectSubset<T, InterviewSessionDeleteArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends InterviewSessionUpdateArgs>(args: Prisma.SelectSubset<T, InterviewSessionUpdateArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends InterviewSessionDeleteManyArgs>(args?: Prisma.SelectSubset<T, InterviewSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends InterviewSessionUpdateManyArgs>(args: Prisma.SelectSubset<T, InterviewSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends InterviewSessionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InterviewSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends InterviewSessionUpsertArgs>(args: Prisma.SelectSubset<T, InterviewSessionUpsertArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends InterviewSessionCountArgs>(args?: Prisma.Subset<T, InterviewSessionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], InterviewSessionCountAggregateOutputType> : number>;
    aggregate<T extends InterviewSessionAggregateArgs>(args: Prisma.Subset<T, InterviewSessionAggregateArgs>): Prisma.PrismaPromise<GetInterviewSessionAggregateType<T>>;
    groupBy<T extends InterviewSessionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: InterviewSessionGroupByArgs['orderBy'];
    } : {
        orderBy?: InterviewSessionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, InterviewSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: InterviewSessionFieldRefs;
}
export interface Prisma__InterviewSessionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    context<T extends Prisma.InterviewContextDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewContextDefaultArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    transcripts<T extends Prisma.InterviewSession$transcriptsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewSession$transcriptsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TranscriptChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    suggestedResponse<T extends Prisma.InterviewSession$suggestedResponseArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewSession$suggestedResponseArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SuggestedResponsePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    summary<T extends Prisma.InterviewSession$summaryArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewSession$summaryArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface InterviewSessionFieldRefs {
    readonly id: Prisma.FieldRef<"InterviewSession", 'String'>;
    readonly status: Prisma.FieldRef<"InterviewSession", 'SessionStatus'>;
    readonly startedAt: Prisma.FieldRef<"InterviewSession", 'DateTime'>;
    readonly endedAt: Prisma.FieldRef<"InterviewSession", 'DateTime'>;
    readonly contextId: Prisma.FieldRef<"InterviewSession", 'String'>;
    readonly createdAt: Prisma.FieldRef<"InterviewSession", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"InterviewSession", 'DateTime'>;
}
export type InterviewSessionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where?: Prisma.InterviewSessionWhereInput;
    orderBy?: Prisma.InterviewSessionOrderByWithRelationInput | Prisma.InterviewSessionOrderByWithRelationInput[];
    cursor?: Prisma.InterviewSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InterviewSessionScalarFieldEnum | Prisma.InterviewSessionScalarFieldEnum[];
};
export type InterviewSessionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where?: Prisma.InterviewSessionWhereInput;
    orderBy?: Prisma.InterviewSessionOrderByWithRelationInput | Prisma.InterviewSessionOrderByWithRelationInput[];
    cursor?: Prisma.InterviewSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InterviewSessionScalarFieldEnum | Prisma.InterviewSessionScalarFieldEnum[];
};
export type InterviewSessionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where?: Prisma.InterviewSessionWhereInput;
    orderBy?: Prisma.InterviewSessionOrderByWithRelationInput | Prisma.InterviewSessionOrderByWithRelationInput[];
    cursor?: Prisma.InterviewSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InterviewSessionScalarFieldEnum | Prisma.InterviewSessionScalarFieldEnum[];
};
export type InterviewSessionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InterviewSessionCreateInput, Prisma.InterviewSessionUncheckedCreateInput>;
};
export type InterviewSessionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.InterviewSessionCreateManyInput | Prisma.InterviewSessionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type InterviewSessionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    data: Prisma.InterviewSessionCreateManyInput | Prisma.InterviewSessionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.InterviewSessionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type InterviewSessionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateInput, Prisma.InterviewSessionUncheckedUpdateInput>;
    where: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.InterviewSessionUpdateManyMutationInput, Prisma.InterviewSessionUncheckedUpdateManyInput>;
    where?: Prisma.InterviewSessionWhereInput;
    limit?: number;
};
export type InterviewSessionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InterviewSessionUpdateManyMutationInput, Prisma.InterviewSessionUncheckedUpdateManyInput>;
    where?: Prisma.InterviewSessionWhereInput;
    limit?: number;
    include?: Prisma.InterviewSessionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type InterviewSessionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where: Prisma.InterviewSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewSessionCreateInput, Prisma.InterviewSessionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.InterviewSessionUpdateInput, Prisma.InterviewSessionUncheckedUpdateInput>;
};
export type InterviewSessionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
    where: Prisma.InterviewSessionWhereUniqueInput;
};
export type InterviewSessionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewSessionWhereInput;
    limit?: number;
};
export type InterviewSession$transcriptsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InterviewSession$suggestedResponseArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InterviewSession$summaryArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where?: Prisma.SessionSummaryWhereInput;
};
export type InterviewSessionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewSessionSelect<ExtArgs> | null;
    omit?: Prisma.InterviewSessionOmit<ExtArgs> | null;
    include?: Prisma.InterviewSessionInclude<ExtArgs> | null;
};
export {};
