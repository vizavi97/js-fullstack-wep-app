import { Migration } from '@mikro-orm/migrations';

export class Migration20200831093651 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" rename column "name" to "title";');


    this.addSql('alter table "post" drop constraint if exists "post_created_at_check";');
    this.addSql('alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "post" alter column "created_at" set default \'NOW()\';');
  }

}
