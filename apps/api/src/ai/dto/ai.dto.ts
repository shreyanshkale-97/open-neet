import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsBoolean, IsArray } from 'class-validator';

export class GenerateQuestionsDto {
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  topicId?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  difficulty!: number;

  @IsInt()
  @Min(1)
  @Max(50)
  count!: number;

  @IsOptional()
  @IsBoolean()
  useAdvancedModel?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];
}