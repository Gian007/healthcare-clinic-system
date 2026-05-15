<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_attachments', function (Blueprint $table) {
            $table->id('attachment_id');
            $table->unsignedBigInteger('doctor_id');
            $table->foreign('doctor_id')->references('doctor_id')->on('doctors')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_attachments');
    }
};
