import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type InterviewContextModel = runtime.Types.Result.DefaultSelection<Prisma.$InterviewContextPayload>;
export type AggregateInterviewContext = {
    _count: InterviewContextCountAggregateOutputType | null;
    _min: InterviewContextMinAggregateOutputType | null;
    _max: InterviewContextMaxAggregateOutputType | null;
};
export type InterviewContextMinAggregateOutputType = {
    id: string | null;
    resumeText: string | null;
    interviewType: string | null;
    jobLevel: string | null;
    jobDescription: string | null;
    companyName: string | null;
    companySegment: string | null;
    responsePreference: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type InterviewContextMaxAggregateOutputType = {
    id: string | null;
    resumeText: string | null;
    interviewType: string | null;
    jobLevel: string | null;
    jobDescription: string | null;
    companyName: string | null;
    companySegment: string | null;
    responsePreference: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type InterviewContextCountAggregateOutputType = {
    id: number;
    resumeText: number;
    interviewType: number;
    jobLevel: number;
    jobDescription: number;
    companyName: number;
    companySegment: number;
    responsePreference: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type InterviewContextMinAggregateInputType = {
    id?: true;
    resumeText?: true;
    interviewType?: true;
    jobLevel?: true;
    jobDescription?: true;
    companyName?: true;
    companySegment?: true;
    responsePreference?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type InterviewContextMaxAggregateInputType = {
    id?: true;
    resumeText?: true;
    interviewType?: true;
    jobLevel?: true;
    jobDescription?: true;
    companyName?: true;
    companySegment?: true;
    responsePreference?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type InterviewContextCountAggregateInputType = {
    id?: true;
    resumeText?: true;
    interviewType?: true;
    jobLevel?: true;
    jobDescription?: true;
    companyName?: true;
    companySegment?: true;
    responsePreference?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type InterviewContextAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewContextWhereInput;
    orderBy?: Prisma.InterviewContextOrderByWithRelationInput | Prisma.InterviewContextOrderByWithRelationInput[];
    cursor?: Prisma.InterviewContextWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | InterviewContextCountAggregateInputType;
    _min?: InterviewContextMinAggregateInputType;
    _max?: InterviewContextMaxAggregateInputType;
};
export type GetInterviewContextAggregateType<T extends InterviewContextAggregateArgs> = {
    [P in keyof T & keyof AggregateInterviewContext]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateInterviewContext[P]> : Prisma.GetScalarType<T[P], AggregateInterviewContext[P]>;
};
export type InterviewContextGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewContextWhereInput;
    orderBy?: Prisma.InterviewContextOrderByWithAggregationInput | Prisma.InterviewContextOrderByWithAggregationInput[];
    by: Prisma.InterviewContextScalarFieldEnum[] | Prisma.InterviewContextScalarFieldEnum;
    having?: Prisma.InterviewContextScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: InterviewContextCountAggregateInputType | true;
    _min?: InterviewContextMinAggregateInputType;
    _max?: InterviewContextMaxAggregateInputType;
};
export type InterviewContextGroupByOutputType = {
    id: string;
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment: string | null;
    responsePreference: string;
    createdAt: Date;
    updatedAt: Date;
    _count: InterviewContextCountAggregateOutputType | null;
    _min: InterviewContextMinAggregateOutputType | null;
    _max: InterviewContextMaxAggregateOutputType | null;
};
type GetInterviewContextGroupByPayload<T extends InterviewContextGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<InterviewContextGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof InterviewContextGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], InterviewContextGroupByOutputType[P]> : Prisma.GetScalarType<T[P], InterviewContextGroupByOutputType[P]>;
}>>;
export type InterviewContextWhereInput = {
    AND?: Prisma.InterviewContextWhereInput | Prisma.InterviewContextWhereInput[];
    OR?: Prisma.InterviewContextWhereInput[];
    NOT?: Prisma.InterviewContextWhereInput | Prisma.InterviewContextWhereInput[];
    id?: Prisma.StringFilter<"InterviewContext"> | string;
    resumeText?: Prisma.StringFilter<"InterviewContext"> | string;
    interviewType?: Prisma.StringFilter<"InterviewContext"> | string;
    jobLevel?: Prisma.StringFilter<"InterviewContext"> | string;
    jobDescription?: Prisma.StringFilter<"InterviewContext"> | string;
    companyName?: Prisma.StringFilter<"InterviewContext"> | string;
    companySegment?: Prisma.StringNullableFilter<"InterviewContext"> | string | null;
    responsePreference?: Prisma.StringFilter<"InterviewContext"> | string;
    createdAt?: Prisma.DateTimeFilter<"InterviewContext"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"InterviewContext"> | Date | string;
    sessions?: Prisma.InterviewSessionListRelationFilter;
};
export type InterviewContextOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    resumeText?: Prisma.SortOrder;
    interviewType?: Prisma.SortOrder;
    jobLevel?: Prisma.SortOrder;
    jobDescription?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    companySegment?: Prisma.SortOrderInput | Prisma.SortOrder;
    responsePreference?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    sessions?: Prisma.InterviewSessionOrderByRelationAggregateInput;
};
export type InterviewContextWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.InterviewContextWhereInput | Prisma.InterviewContextWhereInput[];
    OR?: Prisma.InterviewContextWhereInput[];
    NOT?: Prisma.InterviewContextWhereInput | Prisma.InterviewContextWhereInput[];
    resumeText?: Prisma.StringFilter<"InterviewContext"> | string;
    interviewType?: Prisma.StringFilter<"InterviewContext"> | string;
    jobLevel?: Prisma.StringFilter<"InterviewContext"> | string;
    jobDescription?: Prisma.StringFilter<"InterviewContext"> | string;
    companyName?: Prisma.StringFilter<"InterviewContext"> | string;
    companySegment?: Prisma.StringNullableFilter<"InterviewContext"> | string | null;
    responsePreference?: Prisma.StringFilter<"InterviewContext"> | string;
    createdAt?: Prisma.DateTimeFilter<"InterviewContext"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"InterviewContext"> | Date | string;
    sessions?: Prisma.InterviewSessionListRelationFilter;
}, "id">;
export type InterviewContextOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    resumeText?: Prisma.SortOrder;
    interviewType?: Prisma.SortOrder;
    jobLevel?: Prisma.SortOrder;
    jobDescription?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    companySegment?: Prisma.SortOrderInput | Prisma.SortOrder;
    responsePreference?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.InterviewContextCountOrderByAggregateInput;
    _max?: Prisma.InterviewContextMaxOrderByAggregateInput;
    _min?: Prisma.InterviewContextMinOrderByAggregateInput;
};
export type InterviewContextScalarWhereWithAggregatesInput = {
    AND?: Prisma.InterviewContextScalarWhereWithAggregatesInput | Prisma.InterviewContextScalarWhereWithAggregatesInput[];
    OR?: Prisma.InterviewContextScalarWhereWithAggregatesInput[];
    NOT?: Prisma.InterviewContextScalarWhereWithAggregatesInput | Prisma.InterviewContextScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    resumeText?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    interviewType?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    jobLevel?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    jobDescription?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    companyName?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    companySegment?: Prisma.StringNullableWithAggregatesFilter<"InterviewContext"> | string | null;
    responsePreference?: Prisma.StringWithAggregatesFilter<"InterviewContext"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"InterviewContext"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"InterviewContext"> | Date | string;
};
export type InterviewContextCreateInput = {
    id?: string;
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment?: string | null;
    responsePreference: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    sessions?: Prisma.InterviewSessionCreateNestedManyWithoutContextInput;
};
export type InterviewContextUncheckedCreateInput = {
    id?: string;
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment?: string | null;
    responsePreference: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    sessions?: Prisma.InterviewSessionUncheckedCreateNestedManyWithoutContextInput;
};
export type InterviewContextUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    resumeText?: Prisma.StringFieldUpdateOperationsInput | string;
    interviewType?: Prisma.StringFieldUpdateOperationsInput | string;
    jobLevel?: Prisma.StringFieldUpdateOperationsInput | string;
    jobDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.StringFieldUpdateOperationsInput | string;
    companySegment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePreference?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sessions?: Prisma.InterviewSessionUpdateManyWithoutContextNestedInput;
};
export type InterviewContextUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    resumeText?: Prisma.StringFieldUpdateOperationsInput | string;
    interviewType?: Prisma.StringFieldUpdateOperationsInput | string;
    jobLevel?: Prisma.StringFieldUpdateOperationsInput | string;
    jobDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.StringFieldUpdateOperationsInput | string;
    companySegment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePreference?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sessions?: Prisma.InterviewSessionUncheckedUpdateManyWithoutContextNestedInput;
};
export type InterviewContextCreateManyInput = {
    id?: string;
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment?: string | null;
    responsePreference: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type InterviewContextUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    resumeText?: Prisma.StringFieldUpdateOperationsInput | string;
    interviewType?: Prisma.StringFieldUpdateOperationsInput | string;
    jobLevel?: Prisma.StringFieldUpdateOperationsInput | string;
    jobDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.StringFieldUpdateOperationsInput | string;
    companySegment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePreference?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewContextUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    resumeText?: Prisma.StringFieldUpdateOperationsInput | string;
    interviewType?: Prisma.StringFieldUpdateOperationsInput | string;
    jobLevel?: Prisma.StringFieldUpdateOperationsInput | string;
    jobDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.StringFieldUpdateOperationsInput | string;
    companySegment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePreference?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewContextCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    resumeText?: Prisma.SortOrder;
    interviewType?: Prisma.SortOrder;
    jobLevel?: Prisma.SortOrder;
    jobDescription?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    companySegment?: Prisma.SortOrder;
    responsePreference?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type InterviewContextMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    resumeText?: Prisma.SortOrder;
    interviewType?: Prisma.SortOrder;
    jobLevel?: Prisma.SortOrder;
    jobDescription?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    companySegment?: Prisma.SortOrder;
    responsePreference?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type InterviewContextMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    resumeText?: Prisma.SortOrder;
    interviewType?: Prisma.SortOrder;
    jobLevel?: Prisma.SortOrder;
    jobDescription?: Prisma.SortOrder;
    companyName?: Prisma.SortOrder;
    companySegment?: Prisma.SortOrder;
    responsePreference?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type InterviewContextScalarRelationFilter = {
    is?: Prisma.InterviewContextWhereInput;
    isNot?: Prisma.InterviewContextWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type InterviewContextCreateNestedOneWithoutSessionsInput = {
    create?: Prisma.XOR<Prisma.InterviewContextCreateWithoutSessionsInput, Prisma.InterviewContextUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.InterviewContextCreateOrConnectWithoutSessionsInput;
    connect?: Prisma.InterviewContextWhereUniqueInput;
};
export type InterviewContextUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: Prisma.XOR<Prisma.InterviewContextCreateWithoutSessionsInput, Prisma.InterviewContextUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.InterviewContextCreateOrConnectWithoutSessionsInput;
    upsert?: Prisma.InterviewContextUpsertWithoutSessionsInput;
    connect?: Prisma.InterviewContextWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.InterviewContextUpdateToOneWithWhereWithoutSessionsInput, Prisma.InterviewContextUpdateWithoutSessionsInput>, Prisma.InterviewContextUncheckedUpdateWithoutSessionsInput>;
};
export type InterviewContextCreateWithoutSessionsInput = {
    id?: string;
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment?: string | null;
    responsePreference: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type InterviewContextUncheckedCreateWithoutSessionsInput = {
    id?: string;
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment?: string | null;
    responsePreference: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type InterviewContextCreateOrConnectWithoutSessionsInput = {
    where: Prisma.InterviewContextWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewContextCreateWithoutSessionsInput, Prisma.InterviewContextUncheckedCreateWithoutSessionsInput>;
};
export type InterviewContextUpsertWithoutSessionsInput = {
    update: Prisma.XOR<Prisma.InterviewContextUpdateWithoutSessionsInput, Prisma.InterviewContextUncheckedUpdateWithoutSessionsInput>;
    create: Prisma.XOR<Prisma.InterviewContextCreateWithoutSessionsInput, Prisma.InterviewContextUncheckedCreateWithoutSessionsInput>;
    where?: Prisma.InterviewContextWhereInput;
};
export type InterviewContextUpdateToOneWithWhereWithoutSessionsInput = {
    where?: Prisma.InterviewContextWhereInput;
    data: Prisma.XOR<Prisma.InterviewContextUpdateWithoutSessionsInput, Prisma.InterviewContextUncheckedUpdateWithoutSessionsInput>;
};
export type InterviewContextUpdateWithoutSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    resumeText?: Prisma.StringFieldUpdateOperationsInput | string;
    interviewType?: Prisma.StringFieldUpdateOperationsInput | string;
    jobLevel?: Prisma.StringFieldUpdateOperationsInput | string;
    jobDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.StringFieldUpdateOperationsInput | string;
    companySegment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePreference?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewContextUncheckedUpdateWithoutSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    resumeText?: Prisma.StringFieldUpdateOperationsInput | string;
    interviewType?: Prisma.StringFieldUpdateOperationsInput | string;
    jobLevel?: Prisma.StringFieldUpdateOperationsInput | string;
    jobDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    companyName?: Prisma.StringFieldUpdateOperationsInput | string;
    companySegment?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    responsePreference?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type InterviewContextCountOutputType = {
    sessions: number;
};
export type InterviewContextCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessions?: boolean | InterviewContextCountOutputTypeCountSessionsArgs;
};
export type InterviewContextCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextCountOutputTypeSelect<ExtArgs> | null;
};
export type InterviewContextCountOutputTypeCountSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewSessionWhereInput;
};
export type InterviewContextSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    resumeText?: boolean;
    interviewType?: boolean;
    jobLevel?: boolean;
    jobDescription?: boolean;
    companyName?: boolean;
    companySegment?: boolean;
    responsePreference?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    sessions?: boolean | Prisma.InterviewContext$sessionsArgs<ExtArgs>;
    _count?: boolean | Prisma.InterviewContextCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["interviewContext"]>;
export type InterviewContextSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    resumeText?: boolean;
    interviewType?: boolean;
    jobLevel?: boolean;
    jobDescription?: boolean;
    companyName?: boolean;
    companySegment?: boolean;
    responsePreference?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["interviewContext"]>;
export type InterviewContextSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    resumeText?: boolean;
    interviewType?: boolean;
    jobLevel?: boolean;
    jobDescription?: boolean;
    companyName?: boolean;
    companySegment?: boolean;
    responsePreference?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["interviewContext"]>;
export type InterviewContextSelectScalar = {
    id?: boolean;
    resumeText?: boolean;
    interviewType?: boolean;
    jobLevel?: boolean;
    jobDescription?: boolean;
    companyName?: boolean;
    companySegment?: boolean;
    responsePreference?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type InterviewContextOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "resumeText" | "interviewType" | "jobLevel" | "jobDescription" | "companyName" | "companySegment" | "responsePreference" | "createdAt" | "updatedAt", ExtArgs["result"]["interviewContext"]>;
export type InterviewContextInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    sessions?: boolean | Prisma.InterviewContext$sessionsArgs<ExtArgs>;
    _count?: boolean | Prisma.InterviewContextCountOutputTypeDefaultArgs<ExtArgs>;
};
export type InterviewContextIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type InterviewContextIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $InterviewContextPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "InterviewContext";
    objects: {
        sessions: Prisma.$InterviewSessionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        resumeText: string;
        interviewType: string;
        jobLevel: string;
        jobDescription: string;
        companyName: string;
        companySegment: string | null;
        responsePreference: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["interviewContext"]>;
    composites: {};
};
export type InterviewContextGetPayload<S extends boolean | null | undefined | InterviewContextDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload, S>;
export type InterviewContextCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<InterviewContextFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InterviewContextCountAggregateInputType | true;
};
export interface InterviewContextDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['InterviewContext'];
        meta: {
            name: 'InterviewContext';
        };
    };
    findUnique<T extends InterviewContextFindUniqueArgs>(args: Prisma.SelectSubset<T, InterviewContextFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends InterviewContextFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InterviewContextFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends InterviewContextFindFirstArgs>(args?: Prisma.SelectSubset<T, InterviewContextFindFirstArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends InterviewContextFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InterviewContextFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends InterviewContextFindManyArgs>(args?: Prisma.SelectSubset<T, InterviewContextFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends InterviewContextCreateArgs>(args: Prisma.SelectSubset<T, InterviewContextCreateArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends InterviewContextCreateManyArgs>(args?: Prisma.SelectSubset<T, InterviewContextCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends InterviewContextCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InterviewContextCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends InterviewContextDeleteArgs>(args: Prisma.SelectSubset<T, InterviewContextDeleteArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends InterviewContextUpdateArgs>(args: Prisma.SelectSubset<T, InterviewContextUpdateArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends InterviewContextDeleteManyArgs>(args?: Prisma.SelectSubset<T, InterviewContextDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends InterviewContextUpdateManyArgs>(args: Prisma.SelectSubset<T, InterviewContextUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends InterviewContextUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InterviewContextUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends InterviewContextUpsertArgs>(args: Prisma.SelectSubset<T, InterviewContextUpsertArgs<ExtArgs>>): Prisma.Prisma__InterviewContextClient<runtime.Types.Result.GetResult<Prisma.$InterviewContextPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends InterviewContextCountArgs>(args?: Prisma.Subset<T, InterviewContextCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], InterviewContextCountAggregateOutputType> : number>;
    aggregate<T extends InterviewContextAggregateArgs>(args: Prisma.Subset<T, InterviewContextAggregateArgs>): Prisma.PrismaPromise<GetInterviewContextAggregateType<T>>;
    groupBy<T extends InterviewContextGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: InterviewContextGroupByArgs['orderBy'];
    } : {
        orderBy?: InterviewContextGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, InterviewContextGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewContextGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: InterviewContextFieldRefs;
}
export interface Prisma__InterviewContextClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    sessions<T extends Prisma.InterviewContext$sessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewContext$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface InterviewContextFieldRefs {
    readonly id: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly resumeText: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly interviewType: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly jobLevel: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly jobDescription: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly companyName: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly companySegment: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly responsePreference: Prisma.FieldRef<"InterviewContext", 'String'>;
    readonly createdAt: Prisma.FieldRef<"InterviewContext", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"InterviewContext", 'DateTime'>;
}
export type InterviewContextFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where: Prisma.InterviewContextWhereUniqueInput;
};
export type InterviewContextFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where: Prisma.InterviewContextWhereUniqueInput;
};
export type InterviewContextFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where?: Prisma.InterviewContextWhereInput;
    orderBy?: Prisma.InterviewContextOrderByWithRelationInput | Prisma.InterviewContextOrderByWithRelationInput[];
    cursor?: Prisma.InterviewContextWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InterviewContextScalarFieldEnum | Prisma.InterviewContextScalarFieldEnum[];
};
export type InterviewContextFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where?: Prisma.InterviewContextWhereInput;
    orderBy?: Prisma.InterviewContextOrderByWithRelationInput | Prisma.InterviewContextOrderByWithRelationInput[];
    cursor?: Prisma.InterviewContextWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InterviewContextScalarFieldEnum | Prisma.InterviewContextScalarFieldEnum[];
};
export type InterviewContextFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where?: Prisma.InterviewContextWhereInput;
    orderBy?: Prisma.InterviewContextOrderByWithRelationInput | Prisma.InterviewContextOrderByWithRelationInput[];
    cursor?: Prisma.InterviewContextWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.InterviewContextScalarFieldEnum | Prisma.InterviewContextScalarFieldEnum[];
};
export type InterviewContextCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InterviewContextCreateInput, Prisma.InterviewContextUncheckedCreateInput>;
};
export type InterviewContextCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.InterviewContextCreateManyInput | Prisma.InterviewContextCreateManyInput[];
    skipDuplicates?: boolean;
};
export type InterviewContextCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    data: Prisma.InterviewContextCreateManyInput | Prisma.InterviewContextCreateManyInput[];
    skipDuplicates?: boolean;
};
export type InterviewContextUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InterviewContextUpdateInput, Prisma.InterviewContextUncheckedUpdateInput>;
    where: Prisma.InterviewContextWhereUniqueInput;
};
export type InterviewContextUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.InterviewContextUpdateManyMutationInput, Prisma.InterviewContextUncheckedUpdateManyInput>;
    where?: Prisma.InterviewContextWhereInput;
    limit?: number;
};
export type InterviewContextUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.InterviewContextUpdateManyMutationInput, Prisma.InterviewContextUncheckedUpdateManyInput>;
    where?: Prisma.InterviewContextWhereInput;
    limit?: number;
};
export type InterviewContextUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where: Prisma.InterviewContextWhereUniqueInput;
    create: Prisma.XOR<Prisma.InterviewContextCreateInput, Prisma.InterviewContextUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.InterviewContextUpdateInput, Prisma.InterviewContextUncheckedUpdateInput>;
};
export type InterviewContextDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
    where: Prisma.InterviewContextWhereUniqueInput;
};
export type InterviewContextDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.InterviewContextWhereInput;
    limit?: number;
};
export type InterviewContext$sessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type InterviewContextDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InterviewContextSelect<ExtArgs> | null;
    omit?: Prisma.InterviewContextOmit<ExtArgs> | null;
    include?: Prisma.InterviewContextInclude<ExtArgs> | null;
};
export {};
