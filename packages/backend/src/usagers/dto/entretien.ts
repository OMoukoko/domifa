import { IsOptional } from "class-validator";

export class EntretienDto {
  @IsOptional()
  public domiciliation: boolean;

  @IsOptional()
  public revenus: boolean;

  @IsOptional()
  public revenusDetail: string;

  @IsOptional()
  public typeMenage: string;

  @IsOptional()
  public liencommune: string;

  @IsOptional()
  public residence: string;

  @IsOptional()
  public residenceDetail: string;

  @IsOptional()
  public cause: string;

  @IsOptional()
  public causeDetail: string;

  @IsOptional()
  public pourquoi: string;

  @IsOptional()
  public pourquoiDetail: string;

  @IsOptional()
  public accompagnement: boolean;

  @IsOptional()
  public accompagnementDetail: string;

  @IsOptional()
  public commentaires: string;
}
