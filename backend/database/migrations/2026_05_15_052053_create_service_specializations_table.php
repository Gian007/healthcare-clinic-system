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
        Schema::create('service_specializations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_id');
            $table->unsignedBigInteger('specialization_id');
            $table->foreign('service_id')->references('service_id')->on('services')->onDelete('cascade');
            $table->foreign('specialization_id')->references('specialization_id')->on('specializations')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->unsignedBigInteger('specialization_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_specializations');
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedBigInteger('specialization_id')->nullable(false)->change();
        });
    }
};
