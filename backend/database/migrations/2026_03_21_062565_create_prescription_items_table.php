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
    Schema::create('prescription_items', function (Blueprint $table) {
        $table->id('prescription_item_id');
        $table->unsignedBigInteger('prescription_id');
        $table->foreign('prescription_id')->references('prescription_id')->on('prescriptions');
        $table->string('medicine_name');
        $table->string('generic_name');
        $table->string('strength');
        $table->decimal('dosage_amount', 8, 2);
        $table->string('dosage_unit');
        $table->integer('frequency_per_day');
        $table->integer('interval_hours');
        $table->string('time_instruction');
        $table->string('meal_instruction');
        $table->integer('duration_value');
        $table->enum('duration_unit', ['Days', 'Weeks', 'Months']);
        $table->integer('quantity');
        $table->string('route');
        $table->date('start_date');
        $table->date('end_date');
        $table->text('special_instruction');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
