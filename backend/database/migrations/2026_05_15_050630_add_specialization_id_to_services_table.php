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
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedBigInteger('specialization_id')->nullable()->after('service_id');
            $table->foreign('specialization_id')->references('specialization_id')->on('specializations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['specialization_id']);
            $table->dropColumn('specialization_id');
        });
    }
};
