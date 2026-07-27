import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, QuestionSource, QuestionStatus } from '@neet-ai/shared/types';

export class QuestionOptionDto {
  @IsEnum(['A', 'B', 'C', 'D'])
  optionLabel!: 'A' | 'B' | 'C' | 'D';

  @IsString()
  @IsNotEmpty()
  optionText!: string;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  topicId!: string;

  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  difficulty!: number;

  @IsEnum(QuestionType)
  questionType!: QuestionType;

  @IsEnum(['A', 'B', 'C', 'D'])
  correctOption!: 'A' | 'B' | 'C' | 'D';

  @IsString()
  @IsNotEmpty()
  explanation!: string;

  @IsOptional()
  @IsEnum(QuestionSource)
  source?: QuestionSource;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @ArrayMinSize(4)
  options!: QuestionOptionDto[];
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty?: number;

  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  correctOption?: 'A' | 'B' | 'C' | 'D';

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;
}

export class SearchBankDto {
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unitIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  minDifficulty?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxDifficulty?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeQuestionIds?: string[];

  @IsInt()
  @Min(1)
  @Max(180)
  limit!: number;
}