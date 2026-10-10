export enum Type {
  TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
  NULL = "NULL",
}

export interface PromptResult {
  sacVeMakyaj: string;
  kiyafetVeAksesuarlar: string;
  vucutDurusu: string;
  konumVePozisyon: string;
  isiklandirma: string;
  kameraVeKadraj: string;
  atmosfer: string;
}
