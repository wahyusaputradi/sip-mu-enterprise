<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificationService
{
    public static function sendAttendanceNotification($student, $type, $time, $status)
    {
        try {
            $enabled = SystemSetting::where('key', 'wa_notification_enabled')->value('value');
            if ($enabled !== 'true' && $enabled !== '1') {
                return false;
            }

            $gatewayUrl = SystemSetting::where('key', 'wa_gateway_url')->value('value');
            $apiKey = SystemSetting::where('key', 'wa_gateway_api_key')->value('value');

            if (empty($gatewayUrl) || empty($student->parent_phone)) {
                return false;
            }

            $phone = preg_replace('/[^0-9]/', '', $student->parent_phone);
            if (str_starts_with($phone, '08')) {
                $phone = '628' . substr($phone, 2);
            }

            $className = $student->schoolClass?->name ?? 'SMK';
            $statusStr = $status === 'late' ? 'Hadir Terlambat' : 'Hadir Tepat Waktu';

            if ($type === 'check_in') {
                $message = "Assalamu'alaikum Bpk/Ibu, pemberitahuan bahwa ananda *{$student->name}* ({$className}) telah *MASUK SEKOLAH* pada pukul {$time} WIB (Status: {$statusStr}). Terima kasih.";
            } else {
                $message = "Assalamu'alaikum Bpk/Ibu, pemberitahuan bahwa ananda *{$student->name}* ({$className}) telah *PULANG SEKOLAH* pada pukul {$time} WIB. Terima kasih.";
            }

            Http::timeout(5)->withHeaders([
                'Authorization' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post($gatewayUrl, [
                'target' => $phone,
                'message' => $message,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('WhatsApp Notification Error: ' . $e->getMessage());
            return false;
        }
    }
}
