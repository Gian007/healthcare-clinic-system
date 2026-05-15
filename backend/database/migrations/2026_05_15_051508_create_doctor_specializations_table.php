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
        Schema::create('doctor_specializations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('doctor_id');
            $table->unsignedBigInteger('specialization_id');
            $table->foreign('doctor_id')->references('doctor_id')->on('doctors')->onDelete('cascade');
            $table->foreign('specialization_id')->references('specialization_id')->on('specializations')->onDelete('cascade');
            $table->timestamps();
        });

        // Make specialization_id nullable on doctors table
        Schema::table('doctors', function (Blueprint $table) {
            $table->unsignedBigInteger('specialization_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_specializations');
        Schema::table('doctors', function (Blueprint $table) {
            $table->unsignedBigInteger('specialization_id')->nullable(false)->change();
        });
    }
};
