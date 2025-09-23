import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateJobsTable1758373744464 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'jobs',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'job_id',
            type: 'varchar',
            isUnique: true,
            comment: 'Job ID',
          },
          {
            name: 'queue_name',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'jsonb',
            comment: 'Job payload',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['waiting', 'active', 'completed', 'failed', 'delayed'],
            default: "'waiting'",
          },
          {
            name: 'progress',
            type: 'smallint',
            default: 0,
          },
          {
            name: 'result',
            type: 'jsonb',
            isNullable: true,
            comment: 'Return value from a successful job',
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
            comment: 'Error message or stack trace on failure',
          },
          {
            name: 'processed_on',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'finished_on',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('jobs');
  }
}
