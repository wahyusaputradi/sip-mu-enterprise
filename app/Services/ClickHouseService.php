<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ClickHouseService
{
    protected string $url;
    protected string $username;
    protected string $password;
    protected string $database;
    protected int $timeout;

    public function __construct()
    {
        $config = config('clickhouse');
        $this->url = 'http://' . $config['host'] . ':' . $config['port'];
        $this->username = $config['username'];
        $this->password = $config['password'];
        $this->database = $config['database'];
        $this->timeout = $config['timeout'];
    }

    /**
     * Get baseline headers for ClickHouse HTTP request.
     */
    protected function getHeaders(bool $includeDb = true): array
    {
        $headers = [
            'X-ClickHouse-User' => $this->username,
        ];

        if ($includeDb && !empty($this->database)) {
            $headers['X-ClickHouse-Database'] = $this->database;
        }

        if (!empty($this->password)) {
            $headers['X-ClickHouse-Key'] = $this->password;
        }

        return $headers;
    }

    /**
     * Execute a SQL query (DDL or DML).
     *
     * @throws Exception
     */
    public function execute(string $sql, bool $includeDbHeader = true): string
    {
        try {
            $response = Http::withHeaders($this->getHeaders($includeDbHeader))
                ->timeout($this->timeout)
                ->withBody($sql, 'text/plain')
                ->post($this->url);

            if ($response->failed()) {
                throw new Exception("ClickHouse query failed: " . $response->body());
            }

            return $response->body();
        } catch (Exception $e) {
            Log::error("ClickHouse execute error: " . $e->getMessage(), ['sql' => $sql]);
            throw $e;
        }
    }

    /**
     * Execute a SELECT query and return rows as associative arrays.
     *
     * @throws Exception
     */
    public function select(string $sql): array
    {
        // Request format as JSON for easy parsing
        $formattedSql = trim($sql);
        if (!str_contains(strtolower($formattedSql), 'format json')) {
            $formattedSql = rtrim($formattedSql, ';') . ' FORMAT JSON';
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->timeout($this->timeout)
                ->withBody($formattedSql, 'text/plain')
                ->post($this->url);

            if ($response->failed()) {
                throw new Exception("ClickHouse select failed: " . $response->body());
            }

            $data = $response->json();
            return $data['data'] ?? [];
        } catch (Exception $e) {
            Log::error("ClickHouse select error: " . $e->getMessage(), ['sql' => $sql]);
            throw $e;
        }
    }

    /**
     * Insert batch of rows into ClickHouse.
     *
     * @throws Exception
     */
    public function insert(string $table, array $rows): string
    {
        if (empty($rows)) {
            return '';
        }

        // Format: JSONEachRow allows inserting an array of associative arrays directly
        $query = "INSERT INTO {$table} FORMAT JSONEachRow";
        
        // Convert rows to newline-delimited JSON format
        $payload = implode("\n", array_map(function($row) {
            // Normalize float/int/string values
            return json_encode($row, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }, $rows));

        try {
            // Append query to url parameter or in headers
            $response = Http::withHeaders($this->getHeaders())
                ->timeout($this->timeout)
                ->withBody($payload, 'text/plain')
                ->post($this->url . '/?query=' . urlencode($query));

            if ($response->failed()) {
                throw new Exception("ClickHouse insert failed: " . $response->body());
            }

            return $response->body();
        } catch (Exception $e) {
            Log::error("ClickHouse insert error: " . $e->getMessage(), ['table' => $table]);
            throw $e;
        }
    }
}
