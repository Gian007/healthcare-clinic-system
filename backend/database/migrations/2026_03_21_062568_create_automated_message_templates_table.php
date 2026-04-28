<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('automated_message_templates', function (Blueprint $table) {
        $table->id('template_id');
        $table->string('template_name');
        $table->string('event_trigger');
        $table->string('message_subject');
        $table->text('message_body');
        $table->enum('channel', ['SMS', 'Email', 'In-App']);
        $table->enum('status', ['Active', 'Inactive']);
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automated_message_templates');
    }
};
