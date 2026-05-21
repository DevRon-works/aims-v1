<?php

namespace App\Http\Controllers;

use App\Models\IpAddress;
use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\Process\Process;

class IpAddressController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            IpAddress::query()
                ->latest('updated_at')
                ->get()
                ->map(fn (IpAddress $ipAddress) => $this->toResource($ipAddress))
                ->values(),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $ipAddress = IpAddress::query()->create($this->validatedData($request));

        return response()->json($this->toResource($ipAddress), 201);
    }

    public function update(Request $request, IpAddress $ipAddress): JsonResponse
    {
        $ipAddress->update($this->validatedData($request));

        return response()->json($this->toResource($ipAddress->refresh()));
    }

    public function destroy(IpAddress $ipAddress): JsonResponse
    {
        $ipAddress->delete();

        return response()->json(null, 204);
    }

    public function testConnection(IpAddress $ipAddress): JsonResponse
    {
        $ip = $ipAddress->ip_address;

        if (!$this->isAllowedPingIp($ip)) {
            return response()->json([
                'message' => 'Only private or local IPv4 addresses can be tested.',
            ], 422);
        }

        $command = PHP_OS_FAMILY === 'Windows'
            ? ['ping', '-n', '4', $ip]
            : ['ping', '-c', '4', $ip];

        $process = new Process($command);
        $process->setTimeout(15);
        $process->run();

        $output = trim($process->getOutput().PHP_EOL.$process->getErrorOutput());
        $packetLoss = $this->parsePacketLoss($output);
        $averageLatency = $this->parseAverageLatency($output);
        $online = $process->isSuccessful() && ($packetLoss === null || $packetLoss < 100);

        return response()->json([
            'ip_address' => $ip,
            'online' => $online,
            'status' => $online ? 'online' : 'offline',
            'average_latency_ms' => $averageLatency,
            'packet_loss_percent' => $packetLoss,
            'output' => $output,
        ]);
    }

    private function validatedData(Request $request): array
    {
        $validated = $request->validate([
            'device_type' => ['required', 'string', 'in:desktop,mobile'],
            'location' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'department' => ['required', 'string', 'max:255'],
            'device_name' => ['required', 'string', 'max:255'],
            'mac_address' => [
                'required',
                'string',
                'regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            ],
            'ip_address' => [
                'required',
                'string',
                'ipv4',
            ],
            'status' => [
                'required',
                'string',
                'in:Active,Offline,Reserved,Available,Conflict,Replaced',
            ],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['updated_by'] = $request->user()?->name;

        return $validated;
    }

    private function toResource(IpAddress $ipAddress): array
    {
        return [
            'id' => $ipAddress->id,
            'location' => $ipAddress->location,
            'device_type' => $ipAddress->device_type,
            'device_name' => $ipAddress->device_name ?? $ipAddress->computer_name,
            'name' => $ipAddress->name,
            'department' => $ipAddress->department,
            'mac_address' => $ipAddress->mac_address,
            'ip_address' => $ipAddress->ip_address,
            'status' => $ipAddress->status,
            'notes' => $ipAddress->notes,
            'updated_by' => $ipAddress->updated_by,
            'last_updated' => optional($ipAddress->updated_at)->toDateTimeString(),
            'duplicate_ip' => $ipAddress->duplicate_ip,
            'duplicate_mac' => $ipAddress->duplicate_mac,
            'missing_fields' => $ipAddress->missing_fields ?? [],
            'logs' => $ipAddress->logs ?? [],
            'custom_fields' => app(DynamicTableValueService::class)->values('ip-addresses', $ipAddress->id),
        ];
    }

    private function isAllowedPingIp(string $ip): bool
    {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return false;
        }

        $long = ip2long($ip);

        if ($long === false) {
            return false;
        }

        $ranges = [
            ['10.0.0.0', '10.255.255.255'],
            ['172.16.0.0', '172.31.255.255'],
            ['192.168.0.0', '192.168.255.255'],
            ['127.0.0.0', '127.255.255.255'],
            ['169.254.0.0', '169.254.255.255'],
        ];

        foreach ($ranges as [$start, $end]) {
            if ($long >= ip2long($start) && $long <= ip2long($end)) {
                return true;
            }
        }

        return false;
    }

    private function parsePacketLoss(string $output): ?float
    {
        if (preg_match('/(\d+(?:\.\d+)?)%\s*loss/i', $output, $matches)) {
            return (float) $matches[1];
        }

        if (preg_match('/Lost = \d+ \((\d+(?:\.\d+)?)% loss\)/i', $output, $matches)) {
            return (float) $matches[1];
        }

        return null;
    }

    private function parseAverageLatency(string $output): ?float
    {
        if (preg_match('/Average = (\d+(?:\.\d+)?)ms/i', $output, $matches)) {
            return (float) $matches[1];
        }

        if (preg_match('/=\s*[\d.]+\/([\d.]+)\/[\d.]+\/[\d.]+\s*ms/i', $output, $matches)) {
            return (float) $matches[1];
        }

        return null;
    }
}
