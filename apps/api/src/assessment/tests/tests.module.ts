import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { TestsRepository } from './tests.repository';
import { EvaluationService } from '../evaluation/evaluation.service';
import { ReportsService } from '../reports/reports.service';
import { QuestionsModule } from '../../learning/questions/questions.module';

@Module({
  imports: [QuestionsModule],
  controllers: [TestsController],
  providers: [TestsService, TestsRepository, EvaluationService, ReportsService],
  exports: [TestsService, EvaluationService, ReportsService],
})
export class AssessmentModule {}