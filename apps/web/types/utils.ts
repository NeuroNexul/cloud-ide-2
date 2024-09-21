type MergeTypes<TypesArray extends unknown[], Res = object> = TypesArray extends [
  infer Head,
  ...infer Rem
]
  ? MergeTypes<Rem, Res & Head>
  : Res;

type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

export type OneOf<
  TypesArray extends unknown[],
  Res = never,
  AllProperties = MergeTypes<TypesArray>
> = TypesArray extends [infer Head, ...infer Rem]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProperties>, AllProperties>
  : Res;
