<?php

namespace App\Services;

class GpsTelemetryService
{
    /**
     * Validate GPS telemetry payload sent from frontend client.
     *
     * @param string|null $telemetryJson
     * @return array ['valid' => bool, 'message' => string|null]
     */
    public static function validateTelemetry(?string $telemetryJson): array
    {
        if (empty($telemetryJson)) {
            return ['valid' => true, 'message' => null];
        }

        $data = json_decode($telemetryJson, true);
        if (!is_array($data)) {
            return ['valid' => true, 'message' => null];
        }

        // Check explicit client-side fake GPS flag
        if (isset($data['is_authentic']) && $data['is_authentic'] === false) {
            return [
                'valid' => false,
                'message' => 'Presensi Ditolak: Terdeteksi sinyal GPS tidak asli / terindikasi pemalsuan lompatan lokasi. Silakan gunakan lokasi fisik asli perangkat Anda.'
            ];
        }

        return ['valid' => true, 'message' => null];
    }
}
