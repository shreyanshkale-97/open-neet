import {
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { TestType } from '@neet-ai/shared/types';

export class CreateTestDto {
  @IsEnum(TestType)
  testType!: TestType;

  @IsInt()
  @Min(5)
  @Max(180)
  totalQuestions!: number;

  @IsInt()
  @Min(5)
  @Max(200)
  durationMinutes!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty?: number;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unitIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionIds?: string[];
}

export class SubmitAnswerDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  selectedOption?: 'A' | 'B' | 'C' | 'D' | null;

  @IsOptional()
  @IsBoolean()
  markedForReview?: boolean;

  @IsOptional()
  @IsBoolean()
  visited?: boolean;
}