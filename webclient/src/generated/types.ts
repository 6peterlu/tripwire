import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../../../webserver/src/utils/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  Void: { input: any; output: any; }
};

export type Book = {
  __typename?: 'Book';
  author?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type Event = {
  __typename?: 'Event';
  customerUserID: Scalars['String']['output'];
  eventID: Scalars['String']['output'];
  eventType: Scalars['String']['output'];
  stringifiedEventData: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
};

export type GenericRuleActionInput = {
  ruleActionDefinition: Scalars['JSONObject']['input'];
  ruleActionType: RuleActionType;
};

export enum GenericRuleArgumentEnum {
  Boolean = 'BOOLEAN',
  BooleanArray = 'BOOLEAN_ARRAY',
  JsonField = 'JSON_FIELD',
  Number = 'NUMBER',
  NumberArray = 'NUMBER_ARRAY',
  NumericComparisonOperator = 'NUMERIC_COMPARISON_OPERATOR',
  Signature = 'SIGNATURE',
  String = 'STRING',
  StringArray = 'STRING_ARRAY'
}

export type GenericRuleInput = {
  ruleActions: Array<Scalars['String']['input']>;
  ruleDefinition: Scalars['JSONObject']['input'];
  userSignatureDefinition: Scalars['JSONObject']['input'];
};

export type GenericRuleMetadata = {
  __typename?: 'GenericRuleMetadata';
  arguments: Array<GenericRuleArgumentEnum>;
  functionID: Scalars['String']['output'];
  name: Scalars['String']['output'];
  returns: GenericRuleArgumentEnum;
};

export type GetRuleOptionsInput = {
  outputType: GenericRuleArgumentEnum;
};

export type Metric = {
  __typename?: 'Metric';
  metricID: Scalars['String']['output'];
  metricName: Scalars['String']['output'];
  metricType: MetricType;
  stringifiedMetricDefinition: Scalars['String']['output'];
};

export type MetricInput = {
  metricName: Scalars['String']['input'];
  metricType: MetricType;
  stringifiedMetricDefinition: Scalars['String']['input'];
};

export enum MetricType {
  Count = 'COUNT',
  UniqueValues = 'UNIQUE_VALUES'
}

export type MetricValue = {
  __typename?: 'MetricValue';
  value: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createGenericRule?: Maybe<Scalars['Void']['output']>;
  createGenericRuleAction?: Maybe<Scalars['Void']['output']>;
  createMetric?: Maybe<Scalars['Void']['output']>;
  createRule?: Maybe<Scalars['Void']['output']>;
  deleteMetric?: Maybe<Scalars['Void']['output']>;
};


export type MutationCreateGenericRuleArgs = {
  rule: GenericRuleInput;
};


export type MutationCreateGenericRuleActionArgs = {
  ruleAction: GenericRuleActionInput;
};


export type MutationCreateMetricArgs = {
  metric: MetricInput;
};


export type MutationCreateRuleArgs = {
  rule: RuleInput;
};


export type MutationDeleteMetricArgs = {
  metricID: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getEvents: Array<Event>;
  getMetricValueHistogram: Array<MetricValue>;
  getMetrics: Array<Metric>;
  getRuleActions: Array<RuleAction>;
  getRuleOptions: Array<GenericRuleMetadata>;
  getRules: Array<Rule>;
};


export type QueryGetEventsArgs = {
  customerUserID?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetMetricValueHistogramArgs = {
  metricID: Scalars['String']['input'];
};


export type QueryGetRuleOptionsArgs = {
  input: GetRuleOptionsInput;
};

export type Rule = {
  __typename?: 'Rule';
  name: Scalars['String']['output'];
  ruleActions: Array<RuleActionPreview>;
  ruleID: Scalars['String']['output'];
  thresholds: Array<SingleMetricThreshold>;
};

export type RuleAction = {
  __typename?: 'RuleAction';
  name: Scalars['String']['output'];
  ruleActionID: Scalars['String']['output'];
};

export type RuleActionPreview = {
  __typename?: 'RuleActionPreview';
  name: Scalars['String']['output'];
  ruleActionID: Scalars['String']['output'];
};

export enum RuleActionType {
  UpdateUserAttribute = 'UpdateUserAttribute'
}

export type RuleInput = {
  name: Scalars['String']['input'];
  ruleActions: Array<Scalars['String']['input']>;
  thresholds: Array<SingleMetricThresholdInput>;
};

export type SingleMetricThreshold = {
  __typename?: 'SingleMetricThreshold';
  metricID: Scalars['String']['output'];
  metricName: Scalars['String']['output'];
  operator: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type SingleMetricThresholdInput = {
  metricID: Scalars['String']['input'];
  operator: Scalars['String']['input'];
  value: Scalars['Float']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Book: ResolverTypeWrapper<Book>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Event: ResolverTypeWrapper<Event>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GenericRuleActionInput: GenericRuleActionInput;
  GenericRuleArgumentEnum: GenericRuleArgumentEnum;
  GenericRuleInput: GenericRuleInput;
  GenericRuleMetadata: ResolverTypeWrapper<GenericRuleMetadata>;
  GetRuleOptionsInput: GetRuleOptionsInput;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  Metric: ResolverTypeWrapper<Metric>;
  MetricInput: MetricInput;
  MetricType: MetricType;
  MetricValue: ResolverTypeWrapper<MetricValue>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Rule: ResolverTypeWrapper<Rule>;
  RuleAction: ResolverTypeWrapper<RuleAction>;
  RuleActionPreview: ResolverTypeWrapper<RuleActionPreview>;
  RuleActionType: RuleActionType;
  RuleInput: RuleInput;
  SingleMetricThreshold: ResolverTypeWrapper<SingleMetricThreshold>;
  SingleMetricThresholdInput: SingleMetricThresholdInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Void: ResolverTypeWrapper<Scalars['Void']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Book: Book;
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Event: Event;
  Float: Scalars['Float']['output'];
  GenericRuleActionInput: GenericRuleActionInput;
  GenericRuleInput: GenericRuleInput;
  GenericRuleMetadata: GenericRuleMetadata;
  GetRuleOptionsInput: GetRuleOptionsInput;
  JSONObject: Scalars['JSONObject']['output'];
  Metric: Metric;
  MetricInput: MetricInput;
  MetricValue: MetricValue;
  Mutation: {};
  Query: {};
  Rule: Rule;
  RuleAction: RuleAction;
  RuleActionPreview: RuleActionPreview;
  RuleInput: RuleInput;
  SingleMetricThreshold: SingleMetricThreshold;
  SingleMetricThresholdInput: SingleMetricThresholdInput;
  String: Scalars['String']['output'];
  Void: Scalars['Void']['output'];
};

export type BookResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Book'] = ResolversParentTypes['Book']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  customerUserID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eventID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stringifiedEventData?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericRuleMetadataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GenericRuleMetadata'] = ResolversParentTypes['GenericRuleMetadata']> = {
  arguments?: Resolver<Array<ResolversTypes['GenericRuleArgumentEnum']>, ParentType, ContextType>;
  functionID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  returns?: Resolver<ResolversTypes['GenericRuleArgumentEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type MetricResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Metric'] = ResolversParentTypes['Metric']> = {
  metricID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metricName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metricType?: Resolver<ResolversTypes['MetricType'], ParentType, ContextType>;
  stringifiedMetricDefinition?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetricValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MetricValue'] = ResolversParentTypes['MetricValue']> = {
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createGenericRule?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationCreateGenericRuleArgs, 'rule'>>;
  createGenericRuleAction?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationCreateGenericRuleActionArgs, 'ruleAction'>>;
  createMetric?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationCreateMetricArgs, 'metric'>>;
  createRule?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationCreateRuleArgs, 'rule'>>;
  deleteMetric?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationDeleteMetricArgs, 'metricID'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getEvents?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, Partial<QueryGetEventsArgs>>;
  getMetricValueHistogram?: Resolver<Array<ResolversTypes['MetricValue']>, ParentType, ContextType, RequireFields<QueryGetMetricValueHistogramArgs, 'metricID'>>;
  getMetrics?: Resolver<Array<ResolversTypes['Metric']>, ParentType, ContextType>;
  getRuleActions?: Resolver<Array<ResolversTypes['RuleAction']>, ParentType, ContextType>;
  getRuleOptions?: Resolver<Array<ResolversTypes['GenericRuleMetadata']>, ParentType, ContextType, RequireFields<QueryGetRuleOptionsArgs, 'input'>>;
  getRules?: Resolver<Array<ResolversTypes['Rule']>, ParentType, ContextType>;
};

export type RuleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Rule'] = ResolversParentTypes['Rule']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ruleActions?: Resolver<Array<ResolversTypes['RuleActionPreview']>, ParentType, ContextType>;
  ruleID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thresholds?: Resolver<Array<ResolversTypes['SingleMetricThreshold']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleActionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RuleAction'] = ResolversParentTypes['RuleAction']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ruleActionID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleActionPreviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RuleActionPreview'] = ResolversParentTypes['RuleActionPreview']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ruleActionID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SingleMetricThresholdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SingleMetricThreshold'] = ResolversParentTypes['SingleMetricThreshold']> = {
  metricID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metricName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  operator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type Resolvers<ContextType = Context> = {
  Book?: BookResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  GenericRuleMetadata?: GenericRuleMetadataResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  Metric?: MetricResolvers<ContextType>;
  MetricValue?: MetricValueResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Rule?: RuleResolvers<ContextType>;
  RuleAction?: RuleActionResolvers<ContextType>;
  RuleActionPreview?: RuleActionPreviewResolvers<ContextType>;
  SingleMetricThreshold?: SingleMetricThresholdResolvers<ContextType>;
  Void?: GraphQLScalarType;
};

