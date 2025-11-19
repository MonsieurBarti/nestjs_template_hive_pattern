import { z } from 'zod';
import { ZodSchema } from '@/util/decorators/zod-schema.decorator';

export const CreateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
});

export type CreateArticleDtoType = z.infer<typeof CreateArticleSchema>;

import { ApiProperty } from '@nestjs/swagger';

@ZodSchema(CreateArticleSchema)
export class CreateArticleDto implements CreateArticleDtoType {
  @ApiProperty({
    example: 'My Article Title',
    description: 'The title of the article',
  })
  title!: string;

  @ApiProperty({
    example: 'Some content...',
    description: 'The content of the article',
  })
  content!: string;
}
