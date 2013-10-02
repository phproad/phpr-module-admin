<?php

$table = Db_Structure::table('admin_users');
    $table->primary_key('id');
    $table->column('login', db_varchar, 30)->defaults('')->not_null()->index()->unique();
    $table->column('first_name', db_varchar)->index();
    $table->column('middle_name', db_varchar);
    $table->column('last_name', db_varchar)->index();
    $table->column('password', db_varchar);
    $table->column('email', db_varchar, 50)->index();
    $table->column('phone', db_varchar, 100);
    $table->column('mobile', db_varchar, 100);
    $table->column('time_zone', db_varchar);
    $table->column('status', db_number);
    $table->column('last_login', db_datetime);
    $table->column('password_reset_hash', db_varchar, 150)->index();
    $table->footprints();

$table = Db_Structure::table('admin_rights');
    $table->primary_key('id');
    $table->column('name', db_varchar, 100);
    $table->column('value', db_varchar);
    $table->column('user_id', db_number)->index();
    $table->column('module_id', db_varchar, 50);
    $table->add_key('user_permission', array('user_id', 'module_id', 'name'));

$table = Db_Structure::table('admin_groups');
    $table->primary_key('id');
    $table->column('name', db_varchar);
    $table->column('description', db_varchar);
    $table->column('code', db_varchar, 100);

$table = Db_Structure::table('admin_groups_users');
    $table->column('admin_user_id', db_number)->index();
    $table->column('admin_group_id', db_number)->index();
