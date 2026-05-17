import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SessionSummaryModel = runtime.Types.Result.DefaultSelection<Prisma.$SessionSummaryPayload>;
export type AggregateSessionSummary = {
    _count: SessionSummaryCountAggregateOutputType | null;
    _min: SessionSummaryMinAggregateOutputType | null;
    _max: SessionSummaryMaxAggregateOutputType | null;
};
export type SessionSummaryMinAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    content: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SessionSummaryMaxAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    content: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SessionSummaryCountAggregateOutputType = {
    id: number;
    sessionId: number;
    content: number;
    topics: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SessionSummaryMinAggregateInputType = {
    id?: true;
    sessionId?: true;
    content?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SessionSummaryMaxAggregateInputType = {
    id?: true;
    sessionId?: true;
    content?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SessionSummaryCountAggregateInputType = {
    id?: true;
    sessionId?: true;
    content?: true;
    topics?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SessionSummaryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionSummaryWhereInput;
    orderBy?: Prisma.SessionSummaryOrderByWithRelationInput | Prisma.SessionSummaryOrderByWithRelationInput[];
    cursor?: Prisma.SessionSummaryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SessionSummaryCountAggregateInputType;
    _min?: SessionSummaryMinAggregateInputType;
    _max?: SessionSummaryMaxAggregateInputType;
};
export type GetSessionSummaryAggregateType<T extends SessionSummaryAggregateArgs> = {
    [P in keyof T & keyof AggregateSessionSummary]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSessionSummary[P]> : Prisma.GetScalarType<T[P], AggregateSessionSummary[P]>;
};
export type SessionSummaryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionSummaryWhereInput;
    orderBy?: Prisma.SessionSummaryOrderByWithAggregationInput | Prisma.SessionSummaryOrderByWithAggregationInput[];
    by: Prisma.SessionSummaryScalarFieldEnum[] | Prisma.SessionSummaryScalarFieldEnum;
    having?: Prisma.SessionSummaryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SessionSummaryCountAggregateInputType | true;
    _min?: SessionSummaryMinAggregateInputType;
    _max?: SessionSummaryMaxAggregateInputType;
};
export type SessionSummaryGroupByOutputType = {
    id: string;
    sessionId: string;
    content: string;
    topics: string[];
    createdAt: Date;
    updatedAt: Date;
    _count: SessionSummaryCountAggregateOutputType | null;
    _min: SessionSummaryMinAggregateOutputType | null;
    _max: SessionSummaryMaxAggregateOutputType | null;
};
type GetSessionSummaryGroupByPayload<T extends SessionSummaryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SessionSummaryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SessionSummaryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SessionSummaryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SessionSummaryGroupByOutputType[P]>;
}>>;
export type SessionSummaryWhereInput = {
    AND?: Prisma.SessionSummaryWhereInput | Prisma.SessionSummaryWhereInput[];
    OR?: Prisma.SessionSummaryWhereInput[];
    NOT?: Prisma.SessionSummaryWhereInput | Prisma.SessionSummaryWhereInput[];
    id?: Prisma.StringFilter<"SessionSummary"> | string;
    sessionId?: Prisma.StringFilter<"SessionSummary"> | string;
    content?: Prisma.StringFilter<"SessionSummary"> | string;
    topics?: Prisma.StringNullableListFilter<"SessionSummary">;
    createdAt?: Prisma.DateTimeFilter<"SessionSummary"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SessionSummary"> | Date | string;
    session?: Prisma.XOR<Prisma.InterviewSessionScalarRelationFilter, Prisma.InterviewSessionWhereInput>;
};
export type SessionSummaryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    topics?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    session?: Prisma.InterviewSessionOrderByWithRelationInput;
};
export type SessionSummaryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    sessionId?: string;
    AND?: Prisma.SessionSummaryWhereInput | Prisma.SessionSummaryWhereInput[];
    OR?: Prisma.SessionSummaryWhereInput[];
    NOT?: Prisma.SessionSummaryWhereInput | Prisma.SessionSummaryWhereInput[];
    content?: Prisma.StringFilter<"SessionSummary"> | string;
    topics?: Prisma.StringNullableListFilter<"SessionSummary">;
    createdAt?: Prisma.DateTimeFilter<"SessionSummary"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SessionSummary"> | Date | string;
    session?: Prisma.XOR<Prisma.InterviewSessionScalarRelationFilter, Prisma.InterviewSessionWhereInput>;
}, "id" | "sessionId">;
export type SessionSummaryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    topics?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SessionSummaryCountOrderByAggregateInput;
    _max?: Prisma.SessionSummaryMaxOrderByAggregateInput;
    _min?: Prisma.SessionSummaryMinOrderByAggregateInput;
};
export type SessionSummaryScalarWhereWithAggregatesInput = {
    AND?: Prisma.SessionSummaryScalarWhereWithAggregatesInput | Prisma.SessionSummaryScalarWhereWithAggregatesInput[];
    OR?: Prisma.SessionSummaryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SessionSummaryScalarWhereWithAggregatesInput | Prisma.SessionSummaryScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"SessionSummary"> | string;
    sessionId?: Prisma.StringWithAggregatesFilter<"SessionSummary"> | string;
    content?: Prisma.StringWithAggregatesFilter<"SessionSummary"> | string;
    topics?: Prisma.StringNullableListFilter<"SessionSummary">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"SessionSummary"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"SessionSummary"> | Date | string;
};
export type SessionSummaryCreateInput = {
    id?: string;
    content: string;
    topics?: Prisma.SessionSummaryCreatetopicsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session: Prisma.InterviewSessionCreateNestedOneWithoutSummaryInput;
};
export type SessionSummaryUncheckedCreateInput = {
    id?: string;
    sessionId: string;
    content: string;
    topics?: Prisma.SessionSummaryCreatetopicsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SessionSummaryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    topics?: Prisma.SessionSummaryUpdatetopicsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.InterviewSessionUpdateOneRequiredWithoutSummaryNestedInput;
};
export type SessionSummaryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    topics?: Prisma.SessionSummaryUpdatetopicsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionSummaryCreateManyInput = {
    id?: string;
    sessionId: string;
    content: string;
    topics?: Prisma.SessionSummaryCreatetopicsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SessionSummaryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    topics?: Prisma.SessionSummaryUpdatetopicsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionSummaryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    topics?: Prisma.SessionSummaryUpdatetopicsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionSummaryNullableScalarRelationFilter = {
    is?: Prisma.SessionSummaryWhereInput | null;
    isNot?: Prisma.SessionSummaryWhereInput | null;
};
export type SessionSummaryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    topics?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SessionSummaryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SessionSummaryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SessionSummaryCreateNestedOneWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.SessionSummaryCreateWithoutSessionInput, Prisma.SessionSummaryUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.SessionSummaryCreateOrConnectWithoutSessionInput;
    connect?: Prisma.SessionSummaryWhereUniqueInput;
};
export type SessionSummaryUncheckedCreateNestedOneWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.SessionSummaryCreateWithoutSessionInput, Prisma.SessionSummaryUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.SessionSummaryCreateOrConnectWithoutSessionInput;
    connect?: Prisma.SessionSummaryWhereUniqueInput;
};
export type SessionSummaryUpdateOneWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.SessionSummaryCreateWithoutSessionInput, Prisma.SessionSummaryUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.SessionSummaryCreateOrConnectWithoutSessionInput;
    upsert?: Prisma.SessionSummaryUpsertWithoutSessionInput;
    disconnect?: Prisma.SessionSummaryWhereInput | boolean;
    delete?: Prisma.SessionSummaryWhereInput | boolean;
    connect?: Prisma.SessionSummaryWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SessionSummaryUpdateToOneWithWhereWithoutSessionInput, Prisma.SessionSummaryUpdateWithoutSessionInput>, Prisma.SessionSummaryUncheckedUpdateWithoutSessionInput>;
};
export type SessionSummaryUncheckedUpdateOneWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.SessionSummaryCreateWithoutSessionInput, Prisma.SessionSummaryUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.SessionSummaryCreateOrConnectWithoutSessionInput;
    upsert?: Prisma.SessionSummaryUpsertWithoutSessionInput;
    disconnect?: Prisma.SessionSummaryWhereInput | boolean;
    delete?: Prisma.SessionSummaryWhereInput | boolean;
    connect?: Prisma.SessionSummaryWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SessionSummaryUpdateToOneWithWhereWithoutSessionInput, Prisma.SessionSummaryUpdateWithoutSessionInput>, Prisma.SessionSummaryUncheckedUpdateWithoutSessionInput>;
};
export type SessionSummaryCreatetopicsInput = {
    set: string[];
};
export type SessionSummaryUpdatetopicsInput = {
    set?: string[];
    push?: string | string[];
};
export type SessionSummaryCreateWithoutSessionInput = {
    id?: string;
    content: string;
    topics?: Prisma.SessionSummaryCreatetopicsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SessionSummaryUncheckedCreateWithoutSessionInput = {
    id?: string;
    content: string;
    topics?: Prisma.SessionSummaryCreatetopicsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SessionSummaryCreateOrConnectWithoutSessionInput = {
    where: Prisma.SessionSummaryWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessionSummaryCreateWithoutSessionInput, Prisma.SessionSummaryUncheckedCreateWithoutSessionInput>;
};
export type SessionSummaryUpsertWithoutSessionInput = {
    update: Prisma.XOR<Prisma.SessionSummaryUpdateWithoutSessionInput, Prisma.SessionSummaryUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.SessionSummaryCreateWithoutSessionInput, Prisma.SessionSummaryUncheckedCreateWithoutSessionInput>;
    where?: Prisma.SessionSummaryWhereInput;
};
export type SessionSummaryUpdateToOneWithWhereWithoutSessionInput = {
    where?: Prisma.SessionSummaryWhereInput;
    data: Prisma.XOR<Prisma.SessionSummaryUpdateWithoutSessionInput, Prisma.SessionSummaryUncheckedUpdateWithoutSessionInput>;
};
export type SessionSummaryUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    topics?: Prisma.SessionSummaryUpdatetopicsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionSummaryUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    topics?: Prisma.SessionSummaryUpdatetopicsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SessionSummarySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    topics?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessionSummary"]>;
export type SessionSummarySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    topics?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessionSummary"]>;
export type SessionSummarySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    topics?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["sessionSummary"]>;
export type SessionSummarySelectScalar = {
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    topics?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SessionSummaryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessionId" | "content" | "topics" | "createdAt" | "updatedAt", ExtArgs["result"]["sessionSummary"]>;
export type SessionSummaryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type SessionSummaryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type SessionSummaryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.InterviewSessionDefaultArgs<ExtArgs>;
};
export type $SessionSummaryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SessionSummary";
    objects: {
        session: Prisma.$InterviewSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        sessionId: string;
        content: string;
        topics: string[];
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["sessionSummary"]>;
    composites: {};
};
export type SessionSummaryGetPayload<S extends boolean | null | undefined | SessionSummaryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload, S>;
export type SessionSummaryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SessionSummaryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SessionSummaryCountAggregateInputType | true;
};
export interface SessionSummaryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SessionSummary'];
        meta: {
            name: 'SessionSummary';
        };
    };
    findUnique<T extends SessionSummaryFindUniqueArgs>(args: Prisma.SelectSubset<T, SessionSummaryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SessionSummaryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SessionSummaryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SessionSummaryFindFirstArgs>(args?: Prisma.SelectSubset<T, SessionSummaryFindFirstArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SessionSummaryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SessionSummaryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SessionSummaryFindManyArgs>(args?: Prisma.SelectSubset<T, SessionSummaryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SessionSummaryCreateArgs>(args: Prisma.SelectSubset<T, SessionSummaryCreateArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SessionSummaryCreateManyArgs>(args?: Prisma.SelectSubset<T, SessionSummaryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SessionSummaryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SessionSummaryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SessionSummaryDeleteArgs>(args: Prisma.SelectSubset<T, SessionSummaryDeleteArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SessionSummaryUpdateArgs>(args: Prisma.SelectSubset<T, SessionSummaryUpdateArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SessionSummaryDeleteManyArgs>(args?: Prisma.SelectSubset<T, SessionSummaryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SessionSummaryUpdateManyArgs>(args: Prisma.SelectSubset<T, SessionSummaryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SessionSummaryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SessionSummaryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SessionSummaryUpsertArgs>(args: Prisma.SelectSubset<T, SessionSummaryUpsertArgs<ExtArgs>>): Prisma.Prisma__SessionSummaryClient<runtime.Types.Result.GetResult<Prisma.$SessionSummaryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SessionSummaryCountArgs>(args?: Prisma.Subset<T, SessionSummaryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SessionSummaryCountAggregateOutputType> : number>;
    aggregate<T extends SessionSummaryAggregateArgs>(args: Prisma.Subset<T, SessionSummaryAggregateArgs>): Prisma.PrismaPromise<GetSessionSummaryAggregateType<T>>;
    groupBy<T extends SessionSummaryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SessionSummaryGroupByArgs['orderBy'];
    } : {
        orderBy?: SessionSummaryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SessionSummaryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionSummaryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SessionSummaryFieldRefs;
}
export interface Prisma__SessionSummaryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    session<T extends Prisma.InterviewSessionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.InterviewSessionDefaultArgs<ExtArgs>>): Prisma.Prisma__InterviewSessionClient<runtime.Types.Result.GetResult<Prisma.$InterviewSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SessionSummaryFieldRefs {
    readonly id: Prisma.FieldRef<"SessionSummary", 'String'>;
    readonly sessionId: Prisma.FieldRef<"SessionSummary", 'String'>;
    readonly content: Prisma.FieldRef<"SessionSummary", 'String'>;
    readonly topics: Prisma.FieldRef<"SessionSummary", 'String[]'>;
    readonly createdAt: Prisma.FieldRef<"SessionSummary", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"SessionSummary", 'DateTime'>;
}
export type SessionSummaryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where: Prisma.SessionSummaryWhereUniqueInput;
};
export type SessionSummaryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where: Prisma.SessionSummaryWhereUniqueInput;
};
export type SessionSummaryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where?: Prisma.SessionSummaryWhereInput;
    orderBy?: Prisma.SessionSummaryOrderByWithRelationInput | Prisma.SessionSummaryOrderByWithRelationInput[];
    cursor?: Prisma.SessionSummaryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionSummaryScalarFieldEnum | Prisma.SessionSummaryScalarFieldEnum[];
};
export type SessionSummaryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where?: Prisma.SessionSummaryWhereInput;
    orderBy?: Prisma.SessionSummaryOrderByWithRelationInput | Prisma.SessionSummaryOrderByWithRelationInput[];
    cursor?: Prisma.SessionSummaryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionSummaryScalarFieldEnum | Prisma.SessionSummaryScalarFieldEnum[];
};
export type SessionSummaryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where?: Prisma.SessionSummaryWhereInput;
    orderBy?: Prisma.SessionSummaryOrderByWithRelationInput | Prisma.SessionSummaryOrderByWithRelationInput[];
    cursor?: Prisma.SessionSummaryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SessionSummaryScalarFieldEnum | Prisma.SessionSummaryScalarFieldEnum[];
};
export type SessionSummaryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessionSummaryCreateInput, Prisma.SessionSummaryUncheckedCreateInput>;
};
export type SessionSummaryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SessionSummaryCreateManyInput | Prisma.SessionSummaryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SessionSummaryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    data: Prisma.SessionSummaryCreateManyInput | Prisma.SessionSummaryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SessionSummaryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SessionSummaryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessionSummaryUpdateInput, Prisma.SessionSummaryUncheckedUpdateInput>;
    where: Prisma.SessionSummaryWhereUniqueInput;
};
export type SessionSummaryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SessionSummaryUpdateManyMutationInput, Prisma.SessionSummaryUncheckedUpdateManyInput>;
    where?: Prisma.SessionSummaryWhereInput;
    limit?: number;
};
export type SessionSummaryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SessionSummaryUpdateManyMutationInput, Prisma.SessionSummaryUncheckedUpdateManyInput>;
    where?: Prisma.SessionSummaryWhereInput;
    limit?: number;
    include?: Prisma.SessionSummaryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SessionSummaryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where: Prisma.SessionSummaryWhereUniqueInput;
    create: Prisma.XOR<Prisma.SessionSummaryCreateInput, Prisma.SessionSummaryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SessionSummaryUpdateInput, Prisma.SessionSummaryUncheckedUpdateInput>;
};
export type SessionSummaryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
    where: Prisma.SessionSummaryWhereUniqueInput;
};
export type SessionSummaryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SessionSummaryWhereInput;
    limit?: number;
};
export type SessionSummaryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SessionSummarySelect<ExtArgs> | null;
    omit?: Prisma.SessionSummaryOmit<ExtArgs> | null;
    include?: Prisma.SessionSummaryInclude<ExtArgs> | null;
};
export {};
