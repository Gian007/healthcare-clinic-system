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
    Schema::create('queue_display_screens', function (Blueprint $table) {
        $table->id('screen_id');
        $table->string('screen_name');
        $table->string('location');
        $table->unsignedBigInteger('doctor_id')->nullable();
        $table->foreign('doctor_id')->references('doctor_id')->on('doctors');
        $table->enum('status', ['Active', 'Inactive']);
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_display_screens');
    }
};
