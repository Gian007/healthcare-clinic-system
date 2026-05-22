<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;

class ProcessAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:process-appointments';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Process today\'s appointments and mark no-shows';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting processing of appointments...');

        try {
            Appointment::processNoShows();
            $this->info('Appointments processed successfully.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error processing appointments: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('Artisan app:process-appointments failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
