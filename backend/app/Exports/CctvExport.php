<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class CctvExport implements FromCollection, WithHeadings
{
    public function __construct(
        private readonly Builder $query,
        private readonly array $headings,
        private readonly array $columns,
    ) {
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function collection(): Collection
    {
        return $this->query->get()->map(function ($record) {
            return collect($this->columns)
                ->map(fn (string $column) => $record->{$column} ?? '')
                ->values();
        });
    }
}
