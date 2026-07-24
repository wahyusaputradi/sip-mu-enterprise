<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageCompressionService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Compress an uploaded file (from $request->file('photo')).
     *
     * @param  UploadedFile  $file       The uploaded file instance
     * @param  string        $directory  Storage directory (e.g. 'employee-photos')
     * @param  string        $filename   Target filename without extension (e.g. 'NIK001_nama')
     * @param  string        $type       Compression preset: 'profile' or 'attendance'
     * @return string                    The relative storage path of the saved file
     */
    public function compressFromUpload(UploadedFile $file, string $directory, string $filename, string $type = 'profile'): string
    {
        $config = $this->getConfig($type);
        $outputFormat = config('image.output_format', 'jpg');
        $outputFilename = $filename . '.' . $outputFormat;
        $storagePath = $directory . '/' . $outputFilename;
        $disk = config('filesystems.default', 'public');

        // If compression is disabled, store original file
        if (!config('image.enabled', true)) {
            $originalExt = $file->getClientOriginalExtension();
            $originalFilename = $filename . '.' . $originalExt;
            return $file->storeAs($directory, $originalFilename, $disk);
        }

        try {
            $originalSize = $file->getSize();

            $image = $this->manager->read($file->getPathname());

            // Resize maintaining aspect ratio (scale down only)
            $image->scaleDown(width: $config['max_width'], height: $config['max_height']);

            // Encode to dynamic format with fallback
            try {
                $encoded = $outputFormat === 'webp'
                    ? $image->toWebp($config['quality'])
                    : $image->toJpeg($config['quality']);
            } catch (\Throwable $e) {
                Log::warning("WebP encoding failed, falling back to JPEG: " . $e->getMessage());
                $encoded = $image->toJpeg($config['quality']);
            }

            // Store the compressed image
            Storage::disk($disk)->put($storagePath, (string) $encoded);

            $compressedSize = Storage::disk($disk)->size($storagePath);

            $savedPercent = $originalSize > 0
                ? round((1 - $compressedSize / $originalSize) * 100, 1)
                : 0;

            Log::info('Image compressed', [
                'type' => $type,
                'file' => $storagePath,
                'original_size' => $this->formatBytes($originalSize),
                'compressed_size' => $this->formatBytes($compressedSize),
                'saved' => "{$savedPercent}%",
            ]);

            return $storagePath;
        } catch (\Throwable $e) {
            Log::warning('Image compression failed, storing original file.', [
                'file' => $storagePath,
                'error' => $e->getMessage(),
            ]);

            // Fallback: store original file without compression
            $originalExt = $file->getClientOriginalExtension();
            $fallbackFilename = $filename . '.' . $originalExt;
            return $file->storeAs($directory, $fallbackFilename, $disk);
        }
    }

    /**
     * Compress a base64-encoded image string (from camera capture).
     *
     * @param  string  $base64String  Full base64 string (with or without data URI prefix)
     * @param  string  $directory     Storage directory (e.g. 'attendances/teaching')
     * @param  string  $filename      Target filename without extension
     * @param  string  $type          Compression preset: 'profile' or 'attendance'
     * @return string|null            The relative storage path, or null on failure
     */
    public function compressFromBase64(string $base64String, string $directory, string $filename, string $type = 'attendance'): ?string
    {
        $config = $this->getConfig($type);
        $outputFormat = config('image.output_format', 'jpg');
        $outputFilename = $filename . '.' . $outputFormat;
        $storagePath = $directory . '/' . $outputFilename;

        // Extract raw binary data from base64 string
        $imageData = $this->decodeBase64($base64String);

        if ($imageData === null) {
            return null;
        }

        $disk = config('filesystems.default', 'public');

        // If compression is disabled, store raw data
        if (!config('image.enabled', true)) {
            Storage::disk($disk)->put($storagePath, $imageData);
            return $storagePath;
        }

        try {
            $originalSize = strlen($imageData);

            $image = $this->manager->read($imageData);

            // Resize maintaining aspect ratio (scale down only)
            $image->scaleDown(width: $config['max_width'], height: $config['max_height']);

            // Encode to dynamic format with fallback
            try {
                $encoded = $outputFormat === 'webp'
                    ? $image->toWebp($config['quality'])
                    : $image->toJpeg($config['quality']);
            } catch (\Throwable $e) {
                Log::warning("WebP encoding failed, falling back to JPEG: " . $e->getMessage());
                $encoded = $image->toJpeg($config['quality']);
            }

            // Store the compressed image
            Storage::disk($disk)->put($storagePath, (string) $encoded);

            $compressedSize = Storage::disk($disk)->size($storagePath);

            $savedPercent = $originalSize > 0
                ? round((1 - $compressedSize / $originalSize) * 100, 1)
                : 0;

            Log::info('Image compressed (base64)', [
                'type' => $type,
                'file' => $storagePath,
                'original_size' => $this->formatBytes($originalSize),
                'compressed_size' => $this->formatBytes($compressedSize),
                'saved' => "{$savedPercent}%",
            ]);

            return $storagePath;
        } catch (\Throwable $e) {
            Log::warning('Base64 image compression failed, storing raw data.', [
                'file' => $storagePath,
                'error' => $e->getMessage(),
            ]);

            // Fallback: store uncompressed
            Storage::disk($disk)->put($storagePath, $imageData);
            return $storagePath;
        }
    }

    /**
     * Compress an existing file already stored in the public disk.
     * Used by the batch Artisan command.
     *
     * @param  string  $storagePath  Relative path within public disk
     * @param  string  $type         Compression preset
     * @return array{success: bool, original_size: int, compressed_size: int, saved_percent: float}
     */
    public function compressExistingFile(string $storagePath, string $type = 'profile'): array
    {
        $config = $this->getConfig($type);
        $outputFormat = config('image.output_format', 'jpg');

        $disk = config('filesystems.default', 'public');

        try {
            if (!Storage::disk($disk)->exists($storagePath)) {
                return ['success' => false, 'original_size' => 0, 'compressed_size' => 0, 'saved_percent' => 0];
            }

            $originalSize = Storage::disk($disk)->size($storagePath);
            $fileContent = Storage::disk($disk)->get($storagePath);

            $image = $this->manager->read($fileContent);

            // Resize maintaining aspect ratio (scale down only)
            $image->scaleDown(width: $config['max_width'], height: $config['max_height']);

            // Encode to dynamic format with fallback
            try {
                $encoded = $outputFormat === 'webp'
                    ? $image->toWebp($config['quality'])
                    : $image->toJpeg($config['quality']);
            } catch (\Throwable $e) {
                Log::warning("WebP encoding failed, falling back to JPEG: " . $e->getMessage());
                $encoded = $image->toJpeg($config['quality']);
            }

            // Determine new path (change extension to output format)
            $pathInfo = pathinfo($storagePath);
            $newPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '.' . $outputFormat;

            // Store compressed version
            Storage::disk($disk)->put($newPath, (string) $encoded);

            $compressedSize = Storage::disk($disk)->size($newPath);

            // Remove old file if extension changed
            if ($newPath !== $storagePath && Storage::disk($disk)->exists($storagePath)) {
                Storage::disk($disk)->delete($storagePath);
            }

            $savedPercent = $originalSize > 0
                ? round((1 - $compressedSize / $originalSize) * 100, 1)
                : 0;

            return [
                'success' => true,
                'new_path' => $newPath,
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'saved_percent' => $savedPercent,
            ];
        } catch (\Throwable $e) {
            Log::warning('Failed to compress existing file.', [
                'file' => $storagePath,
                'error' => $e->getMessage(),
            ]);

            return ['success' => false, 'original_size' => 0, 'compressed_size' => 0, 'saved_percent' => 0];
        }
    }

    /**
     * Decode a base64 string (with or without data URI prefix) to binary data.
     */
    protected function decodeBase64(string $base64String): ?string
    {
        // Handle data URI format: data:image/png;base64,iVBOR...
        $parts = explode(';base64,', $base64String);
        if (count($parts) === 2) {
            $decoded = base64_decode($parts[1], true);
            return $decoded !== false ? $decoded : null;
        }

        // Try raw base64
        $decoded = base64_decode($base64String, true);
        return $decoded !== false ? $decoded : null;
    }

    /**
     * Get compression config for a given type.
     */
    protected function getConfig(string $type): array
    {
        return config("image.{$type}", [
            'max_width' => 1024,
            'max_height' => 1024,
            'quality' => 80,
        ]);
    }

    /**
     * Format bytes to human-readable string.
     */
    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}
