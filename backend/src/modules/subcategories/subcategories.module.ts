import { Module } from '@nestjs/common';
import { SubCategoriesController } from './controllers/subcategories.controller';
import { SubCategoriesService } from './services/subcategories.service';

@Module({
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}
