import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'My First Article' })
  title!: string;

  @ApiProperty({ example: 'This is the content of the article.' })
  content!: string;

  @ApiProperty({ example: true })
  isPublished!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
